const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});

class BaseProducer {
	constructor(kafkaInstance) {
		this.producer = kafkaInstance.producer({
			// 架構師建議：開啟冪等性以保證 Data Consistency
			idempotent: true,
			maxInFlightRequests: 1
		});
	}

	async connect() {
		await this.producer.connect();
	}

	/**
	 * 封裝發送邏輯
	 * @param {string} topic
	 * @param {object} payload 業務資料
	 * @param {string} key 訊息 Key (用於保證順序性)
	 */
	async send(topic, payload, key = null) {
		try {
			const result = await this.producer.send({
				topic,
				messages: [
					{
						key,
						value: JSON.stringify({
							data: payload,
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
	}
}

module.exports = BaseProducer;
