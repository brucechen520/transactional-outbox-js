const {
	getPendingOutboxesByTopic,
	updateOutboxStatusByIds,
} = require('../../server/stores/outbox');
const { TOPIC_KUJI_ORDER_CREATED } = process.env;
const KafkaClient = require('../../utils/kafka/client');
const logger = require('../../utils/pino')({
	level: 'debug',
	prettyPrint: true,
});
const { ENUM_OUTBOX_STATUS } = require('../../server/lib/enum');
const Transaction = require('../../utils/db/transaction');
const topicMap = require('./outbox-map-kafka-topic');

module.exports = async function () {
	const txn = new Transaction();

	const handle = async function (transaction) {
		// 1. 讀取：一次最多抓 50 筆 PENDING 的訊息
		// 使用 FOR UPDATE SKIP LOCKED 鎖定這些行，並跳過被其他 worker 鎖定的行
		const outboxes = await getPendingOutboxesByTopic(TOPIC_KUJI_ORDER_CREATED, {
			limit: 50,
			transaction,
			lock: transaction.LOCK.UPDATE,
			skipLocked: true,
		});

		if (outboxes.length === 0) {
			return;
		}

		logger.info(`[${TOPIC_KUJI_ORDER_CREATED}] Found ${outboxes.length} pending outbox messages.`);

		const producer = await KafkaClient.getProducer();

		// 2. 處理：逐一發送到 Kafka。此處若有任何一個訊息發送失敗，會直接拋出錯誤，
		// 讓整個 transaction rollback，確保批次處理的原子性。
		for (const outbox of outboxes) {
			// 查找映射表，若無設定則預設回退到 outbox 原始 topic
			const targetTopics = topicMap.get(outbox.topic) || [outbox.topic];

			// 支援 Fan-out: 迴圈發送到所有目標 Topic
			for (const targetTopic of targetTopics) {
				await producer.send({
					topic: targetTopic,
					payload: outbox.payload,
					key: `${targetTopic}:orderId:${outbox.payload.kujiOrderId}`,
				});
			}
		}

		// 3. 更新：如果全部成功，則將整批訊息狀態更新為 DONE
		const outboxIds = outboxes.map(o => o.id);

		await updateOutboxStatusByIds(outboxIds, {
			status: ENUM_OUTBOX_STATUS.DONE,
		}, { transaction });

		logger.info(`[${TOPIC_KUJI_ORDER_CREATED}] Successfully relayed ${outboxes.length} messages.`);
	};

	await txn.commit(handle);
};
