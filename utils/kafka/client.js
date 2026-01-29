const { Kafka } = require('kafkajs');
const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});
const { kafka: kafkaConfig } = require('config');
const ProducerWrapper = require('./producer');
const ConsumerWrapper = require('./consumer');

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

		this._sharedProducer = null;
		this._consumerMap = new Map();
	}

	// 取得 Kafka 原始實體
	getInstance() {
		return this.kafka;
	}

	async testConnection() {
		const admin = this.kafka.admin();

		try {
			logger.info('正在嘗試連線至 Kafka Broker...');
			await admin.connect();

			// 這是關鍵：獲取集群 Metadata
			// 如果認證失敗或 Broker 位址錯誤，這裡會報錯
			const clusterInfo = await admin.describeCluster();

			logger.info('✅ Kafka 連線成功！');
			logger.info(`Cluster ID: ${clusterInfo.clusterId}`);
			logger.info(`Brokers: ${clusterInfo.brokers.length}`);

			return true;
		} catch (error) {
			logger.error('❌ Kafka 連線失敗:', error.message);
			throw error;
		} finally {
			// 測試完畢務必中斷連線
			await admin.disconnect();
		}
	}

	// 取得全域唯一的 Producer
	async getProducer() {
		if (!this._sharedProducer) {
			this._sharedProducer = new ProducerWrapper(this.kafka);
			await this._sharedProducer.connect();
		}
		return this._sharedProducer;
	}

	// 根據 GroupID 管理 Consumer 單例
	getConsumer(groupId) {
		if (!this._consumerMap.has(groupId)) {
			const consumer = new ConsumerWrapper(this.kafka, groupId);
			this._consumerMap.set(groupId, consumer);
		}
		return this._consumerMap.get(groupId);
	}

	// 優雅停機 (Graceful Shutdown)
	async disconnectAll() {
		try {
			if (this._sharedProducer) {
				await this._sharedProducer.disconnect()
			}

			this._consumerMap.values().forEach(async (consumer) => {
				await consumer.disconnect();
			});

			logger.log('All Kafka connections closed.');
		} catch(error) {
			logger.error('Error disconnecting Kafka clients:', error);
		}
	}
}

module.exports = new KafkaClient(kafkaConfig.client);
