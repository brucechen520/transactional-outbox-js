const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});
const KafkaClient = require('../utils/kafka/client');

module.exports = async function (payload, metadata) {
	logger.info({ payload, metadata }, 'consume kuji order created notify');

	const { kujiOrderId } = payload;

	const producer = await KafkaClient.getProducer();

	await producer.send({
		topic: process.env.TOPIC_UNIFIED_NOTIFICATION,
		payload,
		key: kujiOrderId,
	});

	logger.info('✅ Notification message sent to unified notification topic');
};