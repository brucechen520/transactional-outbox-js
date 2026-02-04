const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

require('dotenv').config();

async function start() {
	try {
		await init();

		await KafkaClient.testConnection();

		const startRelayWorker = require('../daemon/relay-outbox');

		// 啟動 Relay Worker 排程
		startRelayWorker();

	} catch (error) {
		logger.error(error);

		// logger.error('Unable to connect to the database:', text);
		process.exit(1);
	}
}

start();
