const {
	getPendingOutboxByTopic,
	updateOutboxStatusByIds,
} = require('../../server/stores/outbox');
const { KUJI_ORDER_CREATED } = require('./topic');
const KafkaClient = require('../../utils/kafka/client');
const logger = require('../../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});
const { ENUM_OUTBOX_STATUS } = require('../../server/lib/enum');

module.exports = async function () {
	// 1. 讀取：一次最多抓 100 筆 PENDING 的訊息
	const outboxes = await getPendingOutboxByTopic(KUJI_ORDER_CREATED, {
		limit: 100,
	});

	if (outboxes.length === 0) {
		return;
	}

	logger.info(`[${KUJI_ORDER_CREATED}] Found ${outboxes.length} pending outbox messages.`);

	const outboxIds = outboxes.map(o => o.id);

	// 2. 鎖定：馬上將這些訊息狀態更新為 PROCESSING，防止其他 worker 重複處理
	await updateOutboxStatusByIds(outboxIds, ENUM_OUTBOX_STATUS.PROCESSING);

	const producer = await KafkaClient.getProducer();
	const successfulIds = [];
	const failedIds = [];

	// 3. 處理：逐一發送到 Kafka
	for (const outbox of outboxes) {
		try {
			await producer.send({
				topic: outbox.topic,
				payload: outbox.payload,
				key: `kuji:order:${outbox.payload.kujiOrderId}`, // 使用業務相關的 key 來確保訊息分區一致性
			});

			successfulIds.push(outbox.id);
		} catch (error) {
			logger.error({ err: error, outboxId: outbox.id }, `[${KUJI_ORDER_CREATED}] Failed to relay message.`);
			failedIds.push(outbox.id);
		}
	}

	// 4. 更新：根據處理結果，批次更新訊息狀態為 DONE 或 FAILED
	if (successfulIds.length > 0) {
		await updateOutboxStatusByIds(successfulIds, ENUM_OUTBOX_STATUS.DONE);
		logger.info(`[${KUJI_ORDER_CREATED}] Successfully relayed ${successfulIds.length} messages.`);
	}

	if (failedIds.length > 0) {
		await updateOutboxStatusByIds(failedIds, ENUM_OUTBOX_STATUS.FAILED);
		logger.warn(`[${KUJI_ORDER_CREATED}] Failed to relay ${failedIds.length} messages.`);
	}
};
