const FATAL_DATABASE_ERROR_PATTERNS = [
	// Aurora failover / connection lost
	'server has gone away',
	'lost connection to mysql server',
	'read econnreset',

	// Prepared statement failed
	'unknown prepared statement handler',
	'incorrect arguments to mysqld_stmt_execute',

	// Connection pool fatal
	'cannot enqueue',
	'connection lost: the server closed the connection',

	// The MySQL server is running with the --read-only option。
	'read-only',
	'etimedout',
	'protocol_lost',

	// 某些 Proxy/Gatekeeper 斷開連線的訊息
	'connection terminated by user',
];

const RETRY_MATCH = [
	/ETIMEDOUT/,
	/EHOSTUNREACH/,
	/ECONNRESET/,
	/ECONNREFUSED/,
	/ESOCKETTIMEDOUT/,
	/EHOSTUNREACH/,
	/EPIPE/,
	/EAI_AGAIN/,
	/ConnectionError/,
	/SequelizeConnectionError/,
	/SequelizeConnectionRefusedError/,
	/SequelizeHostNotFoundError/,
	/SequelizeHostNotReachableError/,
	/SequelizeInvalidConnectionError/,
	/SequelizeConnectionTimedOutError/,
	/ConnectionAcquireTimeoutError/,
	/SequelizeConnectionAcquireTimeoutError/,
	/Connection terminated unexpectedly/,
];

module.exports = {
	FATAL_DATABASE_ERROR_PATTERNS,
	RETRY_MATCH,
};
