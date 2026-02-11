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
	async start({ topic, handler }) {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic, fromBeginning: false });

		await this.consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					const value = message.value.toString();
					const payload = JSON.parse(value);

					// 執行業務邏輯
					await handler(payload, { topic, partition, offset: message.offset });

				} catch (error) {
					// TODO: 在此實作重試或發送到死信隊列 (DLQ)
					// 這裡建議不要 throw error，否則會導致 consumer crash 並重啟
					logger.error({ err: error, topic, partition, offset: message.offset }, `Consumer Error on topic ${topic}`);
				}
			},
		});
	}

	/**
	 * 啟動消費者並根據 Topic 分發給對應的 Handler
	 * @deprecated 在微服務架構下，建議一個 Pod 只監聽一個 Topic 或一組高度相關的 Topic
	 * @param {Map<string, Function>} routerMap Key: Topic, Value: Handler
	 */
	async startTopics(routerMap) {
		for (const [topic, handler] of routerMap) {
			await this.start({ topic, handler });
		}
	}

	async disconnect() {
		await this.consumer.disconnect();
	}
}

module.exports = BaseConsumer;
