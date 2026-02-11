const Sequelize = require('sequelize');
const KujiStore = require('../stores/kuji');
const OutboxStore = require('../stores/outbox');
const UserStore = require('../stores/user');
const KafkaClient = require('../../utils/kafka/client');
const { getSequelize } = require('../../utils/db');
const Transaction = require('../../utils/db/transaction');
const logger = require('../../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});
const ApiError = require('../../utils/fastify/error');
const { ENUM_OUTBOX_STATUS } = require('../lib/enum');
const {
	TOPIC_KUJI_ORDER_CREATED,
} = process.env;

/**
 * ❌ 錯誤示範：Kafka有資料寫進去，但在 db.commit前，db發生 rollback 或 connection closed，導致「沒訂單、有訊息」，俗稱 zombie data
 * 關鍵錯誤：會導致 mq的商業邏輯要回查資料庫時找不到資料。
 * 物流系統收到 Kafka 訊息開始打包寄出，但資料庫因為 Rollback 根本沒成立訂單。結果公司平白無故把商品送給了沒付錢的人。
 */
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

/**
 * ❌ 錯誤示範：Kafka 發生問題導致資料沒寫進 queue導致「有訂單、沒訊息」
 * 關鍵錯誤：會導致 mq的商業邏輯不會執行到。
 * 資料庫執行扣款動作，但扣款後續的訂單通知、信件通知等一系列的商業邏輯都不會執行，因為 mq資料不一致。
 */
async function badScenarioWithMQ() {
	const producer = await KafkaClient.getProducer();

	logger.info('開始新增一番賞訂單');

	const kujiOrder = await KujiStore.createKujiOrder({
		id: 1,
		userId: 1,
		prizeName: '魯夫',
	});

	logger.info('開始送出資料到 kafka');

	throw ApiError.Internal('kafka rebalance error', 'KAFKA_REBLANCE_ERROR');

	// 2. 發送 Kafka (假設成功)
	await producer.send({
		topic: 'kuji-topic',
		payload: {
			id: 1,
			userId: 1,
			prizeName: '魯夫',
		},
		key: TOPIC_KUJI_ORDER_CREATED,
	});
}

/**
 * ❌ 錯誤示範：連線池耗盡 (Connection Pool Exhaustion)
 * 關鍵錯誤：Transaction 就像租了一台計程車(連線)，
 * 你卻讓計程車在路邊等你買完東西(Kafka 回應)才付錢放它走。
 */
async function badScenarioWithConnectionPoolExhaustion() {
	const sequelize = await getSequelize();

	// 事務開始，此時佔用一個 MySQL Connection
	const t = await sequelize.transaction();

	try {
		const kujiOrder = await KujiStore.createKujiOrder({
			id: 1,
			userId: 1,
			prizeName: '魯夫',
		}, { transaction: t });

		// ⚠️ 致命傷：在 Transaction 內部進行網路 IO
		// 假設 Kafka 因為網路問題，回應時間從 10ms 變成 5s
		logger.info("⏳ 等待 Kafka 回應中...");

		// ⚠️ 災難開始：在 Transaction 尚未 Commit 前進行長時間的 Await
		// 這條 DB 連線現在只能發呆，不能給其他人用
		await new Promise(resolve => setTimeout(resolve, 61000)); // 模擬 Kafka 延遲

		const producer = await KafkaClient.getProducer();

		await producer.send({
			topic: TOPIC_KUJI_ORDER_CREATED,
			payload: {
				id: 1,
				userId: 1,
				prizeName: '魯夫',
			},
			key: TOPIC_KUJI_ORDER_CREATED,
		});

		await t.commit(); // 執行到這 connection才會還給 pool

		return kujiOrder;
	} catch (error) {
		await t.rollback();
		throw error;
	}
}

async function createKujiOrder({
	requestId,
	userId,
	prizeName,
}) {
	const user = await UserStore.getUserById(userId, {
		attributes: ['id'],
	});

	if (user === null) {
		throw ApiError.NotFound('user not found', 'USER_NOT_FOUND_ERROR');
	}

	try {
		const txn = new Transaction();

		const handle = async function (transaction) {
			const kujiOrder = await KujiStore.createKujiOrder({
				userId,
				prizeName,
			}, { transaction });

			await OutboxStore.createOutbox({
				topic: TOPIC_KUJI_ORDER_CREATED,
				payload: { userId, kujiOrderId: kujiOrder.id, requestId },
				status: ENUM_OUTBOX_STATUS.PENDING,
			}, { transaction });

			return kujiOrder;
		};

		return await txn.commit(handle);
	} catch (error) {
		if (error instanceof Sequelize.UniqueConstraintError) {
			throw ApiError.Conflict('kuji order conflicted', 'KUJI_ORDER_CONFLICT');
		}

		throw error;
	}
}

module.exports = {
	badScenarioWithDB,
	badScenarioWithMQ,
	badScenarioWithConnectionPoolExhaustion,
	createKujiOrder,
};
