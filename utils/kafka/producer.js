const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});

class BaseProducer {
	constructor(kafkaInstance) {
		this.producer = kafkaInstance.producer({
			idempotent: true, // 開啟冪等性以保證 Data Consistency
			maxInFlightRequests: 1 // 保證訊息順序性
		});

		this.isConnected = false;
	}

	async connect() {
		if (!this.isConnected) {
			await this.producer.connect();

			this.isConnected = true;
			logger.info('Kafka Producer connected successfully.');
		}
	}

	/**
	 * 封裝發送邏輯
	 * @param {string} topic
	 * @param {object} payload 業務資料
	 * @param {string} key 訊息 Key (用於保證順序性)
	 */
	async send({
		topic,
		payload,
		key = 'default:key',
	}) {
		try {
			const result = await this.producer.send({
				topic,
				messages: [
					{
						key,
						value: JSON.stringify({
							payload,
							timestamp: Date.now(),
							// 可以在此注入 TraceID 供鏈路追蹤
						})
					}
				]
			});
			return result;
		} catch (error) {
			// 資安與維運建議：錯誤不應包含敏感資訊，但需記錄 Topic 與 Key
			logger.error(`Failed to send message to ${topic}:`, error.message);
			throw error;
		}
	}

	async disconnect() {
		await this.producer.disconnect();

		this.isConnected = false;
	}
}

module.exports = BaseProducer;
