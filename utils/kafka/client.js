const { Kafka, logLevel } = require('kafkajs');
const logger = require('../pino')({
	level: 'debug',
	prettyPrint: false,
});
const { kafka: kafkaConfig } = require('config');
const ProducerWrapper = require('./producer');
const ConsumerWrapper = require('./consumer');
const logCreator = (level) => ({ namespace, level, label, log }) => {
	// 💡 關鍵修正：確保 log 物件存在，並安全地取出訊息
	const message = log?.message || 'No message provided';
	const { stack, ...extra } = log;

	switch (level) {
		case logLevel.ERROR:
			logger.error({ namespace, ...extra, stack }, message);
			break;
		case logLevel.WARN:
			logger.warn({ namespace, ...extra }, message);
			break;
		case logLevel.INFO:
			logger.info({ namespace, ...extra }, message);
			break;
		default:
			logger.debug({ namespace, ...extra }, message);
	}
};

class KafkaClient {
	constructor(config) {
		this.kafka = new Kafka({
			clientId: config.clientId || 'my-app',
			brokers: config.brokers,
			// 建議：將日誌導向至專案使用的 Logger (如 Pino 或 Winston)
			logCreator,
			// 資安建議：生產環境務必使用 SSL/SASL
			ssl: config.ssl || false,
			sasl: config.sasl,
		});

		this._sharedProducer = null;
		this._sharedConsumer = null;
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

	/***
	 * @description: kafka consumer run on the k8s pods that will only handle 1 groupId. GroupId must pass from outside(ex: aws config map, yaml)
	 * @argument: groupId: String
	 * */
	getConsumer(groupId) {
		if (!this._sharedConsumer) {
			const consumer = new ConsumerWrapper(this.kafka, groupId);
			this._sharedConsumer = consumer;
		}

		return this._sharedConsumer;
	}

	// Graceful Shutdown
	async disconnectAll() {
		try {
			if (this._sharedProducer) {
				await this._sharedProducer.disconnect()
			}

			this._consumerMap.values().forEach(async (consumer) => {
				await consumer.disconnect();
			});

			logger.info('All Kafka connections closed.');
		} catch(error) {
			logger.error('Error disconnecting Kafka clients:', error);
		}
	}
}

module.exports = new KafkaClient(kafkaConfig.client);
