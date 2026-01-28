const { Kafka, logLevel } = require('kafkajs');
const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});

class KafkaClient {
	constructor(config) {
		this.kafka = new Kafka({
			clientId: config.clientId || 'my-app',
			brokers: config.brokers,
			// 建議：將日誌導向至專案使用的 Logger (如 Pino 或 Winston)
			logCreator: (level) => ({ entry }) => {
				logger.log(`[Kafka] ${entry.message}`, entry);
			},
			// 資安建議：生產環境務必使用 SSL/SASL
			ssl: config.ssl || false,
			sasl: config.sasl,
			retry: {
				initialRetryTime: 300,
				retries: 8
			}
		});

		this.producers = [];
		this.consumers = [];
	}

	// 取得 Kafka 原始實體
	getInstance() {
		return this.kafka;
	}

	// 優雅停機 (Graceful Shutdown)
	async disconnectAll() {
		await Promise.all([
			...this.producers.map(p => p.disconnect()),
			...this.consumers.map(c => c.disconnect())
		]);
		logger.log('All Kafka connections closed.');
	}
}

module.exports = KafkaClient;
