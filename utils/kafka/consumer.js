const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});

class BaseConsumer {
	constructor(kafkaInstance, groupId) {
		this.consumer = kafkaInstance.consumer({ groupId });
	}

	/**
	 * 啟動消費者
	 * @param {string} topic
	 * @param {Function} messageHandler 處理訊息的 Callback
	 */
	async start(topic, messageHandler) {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic, fromBeginning: false });

		await this.consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					const rawValue = message.value.toString();
					const parsedValue = JSON.parse(rawValue);

					// 執行業務邏輯
					await messageHandler(parsedValue, { partition, offset: message.offset });

				} catch (error) {
					// TODO: 在此實作重試或發送到死信隊列 (DLQ)
					logger.error(`Consumer Error on topic ${topic}:`, error.message);
				}
			},
		});
	}

	async disconnect() {
		await this.consumer.disconnect();
	}
}

module.exports = BaseConsumer;
