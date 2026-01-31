const KujiStore = require('../stores/kuji');
const OutboxStore = require('../stores/outbox');
const KafkaClient = require('../../utils/kafka/client');
const { getSequelize } = require('../../utils/db');
const logger = require('../../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

async function badScenarioWithDB() {
	const producer = await KafkaClient.getProducer();

	logger.info('開始新增一番賞訂單');

	const sequelize = await getSequelize();

	const t = await sequelize.transaction();

	await KujiStore.createKujiOrder({
		id: 1,
		userId: 1,
		prizeName: '魯夫',
	}, { transaction: t });

	// 2. 發送 Kafka (假設成功)
	await producer.send({
		topic: 'kuji-topic',
		payload: {
			id: 1,
			userId: 1,
			prizeName: '魯夫',
		},
		key: 'kuji:order:created',
	});

	logger.info('✅ Kafka 已送出');

	// Sequelize 的 t.connection 存放了底層連線物件
	t.connection.destroy();

	logger.info('💥 連線已強制銷毀');

	// 3. 嘗試 Commit，此時會拋出 Connection Error
	await t.commit();
}

async function badScenarioWithMQ() {
	const producer = await KafkaClient.getProducer();
}

module.exports = {
	badScenarioWithDB,
	badScenarioWithMQ,
};
