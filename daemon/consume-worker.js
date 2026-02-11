const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

module.exports = async function startWorker({ groupId, topic, handler }) {
	try {
		logger.info(`Starting consumer worker for group: ${groupId}, topic: ${topic}`);

		// 3. 取得 Consumer 實例
		const consumer = KafkaClient.getConsumer(groupId);

		// 4. 啟動訂閱
		await consumer.start({ topic, handler });

		logger.info(`Consumer worker started successfully.`);
	} catch (error) {
		logger.error({ err: error }, 'Fatal error in consumer worker');
		process.exit(1);
	}
};
