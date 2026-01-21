const Sequelize = require('sequelize');
const { FATAL_DATABASE_ERROR_PATTERNS, RETRY_MATCH } = require('./constants');
const Transaction = require('./transaction');

const logger = require('../pino')();

async function createConnection(url, {
	maxPoolSize = 4,
	minPoolSize = 1,
	logging = false,
	timeout = 60000,
	decimalNumbers = true,
} = {}) {
	console.log(`connecting ${url}...`);

	if (logging === true) {
		logging = console.log;
	} else {
		logging = (sql, timing) => {
			if (timing >= 3000) {
				logger.warn(`${sql} Elapsed time: ${timing}ms (slow query)`);
			}
		};
	}

	const sequelize = new Sequelize(url, {
		logging,
		dialect: 'mysql',
		pool: {
			max: maxPoolSize,
			min: minPoolSize,
			acquire: 60000,
			idle: 60000,
			evict: 10000,
		},
		timezone: '+08:00',
		benchmark: true,
		define: {
			timestamps: true,
			charset: 'utf8mb4',
		},
		query: {
			raw: true,
		},
		dialectOptions: {
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
			decimalNumbers,
			connectTimeout: timeout,
			maxPreparedStatements: 1024,
		},
		retry: {
			match: RETRY_MATCH,
			name: 'query',
			backoffBase: 100,
			backoffExponent: 1.1,
			timeout,
			max: Infinity
		},
	});

	let isShuttingDown = false;

	sequelize.query = function() {
		return Sequelize.prototype.query.apply(this, arguments).catch(async function (err) {
			if (err instanceof Sequelize.DatabaseError) {
				const message = (err.message || '').toLowerCase();

				const hasFatalDatabaseError = FATAL_DATABASE_ERROR_PATTERNS.some(e => message.includes(e));

				if (hasFatalDatabaseError && !isShuttingDown) {
					isShuttingDown = true;

					console.error(err);

					try {
						await sequelize.close();
					} catch (error) {
						console.error(err);
					} finally {
						process.exit(1);
					}
				}
			}

			throw err;
		});
	};

	try {
		await sequelize.authenticate();
	} catch (error) {
		console.error(error);

		throw error;
	}

	console.log(`✔ connected ${url}`);

	module.exports.sequelize = sequelize;
	Transaction.sequelize = sequelize;

	return sequelize;
};

async function createTTLSchedule({
	eventName,
	table,
	where,
	column,
	expiredAfterSeconds,
}) {
	const { sequelize } = module.exports;

	if (eventName === undefined) {
		eventName = `ttl_${table}`;
	}

	where = where !== undefined ? where += ' &&' : '';

	await sequelize.query(
		`DROP EVENT IF EXISTS \`${eventName}\`;`
	);

	await sequelize.query(
		`CREATE EVENT \`${eventName}\` ` +
		`ON SCHEDULE EVERY 60 SECOND ` +
		"DO BEGIN " +
		`DELETE FROM \`${table}\` WHERE ${where} ${column} < NOW() - INTERVAL ${expiredAfterSeconds} SECOND; ` +
		"END"
	);

	await sequelize.query(
		`ALTER TABLE \`${table}\` ADD INDEX (${column})`
	);
};

async function createSimpleTTLSchedule({
	table, expiredAfterSeconds, interval = 60,
}) {
	const { sequelize } = module.exports;

	await sequelize.query(
		`DROP EVENT IF EXISTS drop_expired_${table};`
	);

	await sequelize.query(
		`CREATE EVENT drop_expired_${table} ` +
		`ON SCHEDULE EVERY ${interval} SECOND ` +
		"DO BEGIN " +
		`DELETE FROM ${table} WHERE createdAt < NOW() - INTERVAL ${expiredAfterSeconds} SECOND; ` +
		"END"
	);

	await sequelize.query(
		`ALTER TABLE ${table} ADD INDEX created_at(createdAt)`
	);
};

async function createListPartitionTTLSchedule({
	table, ttl, partitions, interval = 60,
}) {
	const { sequelize } = module.exports;

	const dividedPartitions = [];

	for (let i = 0; i < partitions; i++) {
		dividedPartitions.push(`PARTITION p${i} VALUES IN (${i})`);
	}

	await sequelize.query(
		`ALTER TABLE ${table} MODIFY COLUMN pid TINYINT(4) GENERATED ALWAYS AS (floor(TO_SECONDS(createdAt)/${ttl})%${partitions}) STORED NOT NULL;`
	);

	await sequelize.query(
		`ALTER TABLE ${table} DROP PRIMARY KEY, ADD PRIMARY KEY(id, pid);`
	);

	await sequelize.query(
		`ALTER TABLE ${table} PARTITION BY LIST (pid) (${dividedPartitions.join(",")});`
	);

	const truncatedPartitions = [];

	for (let i = 0; i < partitions; i++) {
		if (i === (partitions - 1)) {
			truncatedPartitions.push(`WHEN ${i} THEN ALTER TABLE ${table} TRUNCATE PARTITION p0`);
		} else {
			truncatedPartitions.push(`WHEN ${i} THEN ALTER TABLE ${table} TRUNCATE PARTITION p${i + 1}`);
		}
	}

	await sequelize.query(
		`DROP EVENT IF EXISTS ttl_${table};`
	);

	await sequelize.query(
		`CREATE EVENT ttl_${table} ` +
		`ON SCHEDULE EVERY ${interval} SECOND ` +
		"DO BEGIN " +
		`CASE FLOOR(TO_SECONDS(NOW())/${ttl})%${partitions} ` +
		`${truncatedPartitions.join(";")}; ` +
		"END CASE; " +
		"END"
	);
};

async function createRangePartitionTTLSchedule({
	database,
	table,
	partitionedByDays = 10,
	expiredAfterDays,
}) {
	const {
		sequelize,
		createSchedule,
	} = module.exports;

	if (database === undefined || table === undefined) {
		throw new Error("database & table required");
	}

	await sequelize.query(
		`ALTER TABLE ${table} DROP PRIMARY KEY, ADD PRIMARY KEY(id, createdAt)`
	);

	await sequelize.query(
		`ALTER TABLE ${table} PARTITION BY RANGE(TO_DAYS(createdAt)) (
			PARTITION p0 VALUES LESS THAN (0)
		)`
	);

	await createSchedule({
		name: `create_new_${table}_partition`,
		job: `
			SET @day_after_interval = TO_DAYS(ADDDATE(CURRENT_DATE(), INTERVAL ${partitionedByDays} DAY));
			SELECT PARTITION_DESCRIPTION INTO @latest_partition_in_day FROM INFORMATION_SCHEMA.PARTITIONS
			WHERE TABLE_SCHEMA="${database}" AND TABLE_NAME="${table}" ORDER BY PARTITION_DESCRIPTION DESC LIMIT 1;
			IF @latest_partition_in_day = 0 THEN
				SET @new_parition_in_date = DATE_FORMAT(FROM_DAYS(@day_after_interval), "%Y_%m_%d");
				SET @q = CONCAT(
					'ALTER TABLE ${table} ADD PARTITION (PARTITION p', @new_parition_in_date, ' VALUES LESS THAN (', @day_after_interval, '))'
				);
				PREPARE stmt FROM @q;
				EXECUTE stmt;
			ELSEIF @latest_partition_in_day <= @day_after_interval THEN
				SELECT @new_partition_in_day := SUM(@latest_partition_in_day + ${partitionedByDays});
				SET @new_parition_in_date = DATE_FORMAT(FROM_DAYS(@new_partition_in_day), "%Y_%m_%d");
				SET @q = CONCAT(
					'ALTER TABLE ${table} ADD PARTITION (PARTITION p', @new_parition_in_date, ' VALUES LESS THAN (', @new_partition_in_day, '))'
				);
				PREPARE stmt FROM @q;
				EXECUTE stmt;
			END IF;
		`,
	});

	await createSchedule({
		name: `drop_expired_${table}_partition`,
		job: `
			SELECT PARTITION_NAME INTO @expired_partition_name FROM INFORMATION_SCHEMA.PARTITIONS
			WHERE TABLE_SCHEMA="${database}" AND TABLE_NAME="${table}" AND PARTITION_NAME != "p0"
			AND PARTITION_DESCRIPTION <= TO_DAYS(SUBDATE(current_date(), INTERVAL ${expiredAfterDays} DAY))
			ORDER BY PARTITION_DESCRIPTION ASC LIMIT 1;
			IF @expired_partition_name IS NOT NULL THEN
				SET @q = CONCAT("ALTER TABLE ${table} DROP PARTITION ", @expired_partition_name);
				PREPARE stmt FROM @q;
				EXECUTE stmt;
			END IF;
		`,
	});
};

async function createSchedule({
	name,
	job,
}) {
	const { sequelize } = module.exports;

	if (!name || !job) {
		throw new Error('missing name or job');
	}

	await sequelize.query(`DROP EVENT IF EXISTS ${name};`);

	const script = `
		CREATE EVENT ${name}
		ON SCHEDULE EVERY 1 HOUR
		DO BEGIN ${job}
		END;
	`;

	return sequelize.query(script);
};

module.exports = {
	createConnection,
	createTTLSchedule,
	createSimpleTTLSchedule,
	createListPartitionTTLSchedule,
	createRangePartitionTTLSchedule,
	createSchedule,
};
