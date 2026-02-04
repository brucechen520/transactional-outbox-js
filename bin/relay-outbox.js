const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

async function testConnection() {
	try {
		await init();

		await KafkaClient.testConnection();
	} catch (error) {
		logger.error(error);

		// logger.error('Unable to connect to the database:', text);
		process.exit(1);
	}
}

testConnection();
