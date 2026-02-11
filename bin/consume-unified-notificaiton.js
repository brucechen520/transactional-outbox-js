const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: true,
});

require('dotenv').config();

async function start() {
	try {
		// 初始化 DB (若 Consumer 邏輯需要查庫)
		await init();

		await KafkaClient.testConnection();

		const startConsumerWorker = require('../daemon/consume-queue');

		await startConsumerWorker();
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
}

start();