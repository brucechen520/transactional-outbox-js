require('dotenv').config();
const startWorker = require('../daemon/consume-worker');

async function run () {
	// 1. 初始化 DB (若 Consumer 邏輯需要查庫)
	await init();

	// 2. 測試 Kafka 連線
	await KafkaClient.testConnection();

	const {
		CONSUME_KUJI_ORDER_DLQ: handler
	} = require('../consumers');

	// 假設 DLQ 使用獨立的 Group 或者共用某個 Group，這裡示範使用獨立 Group
	startWorker({
		groupId: process.env.GROUP_CONSUME_DLQ,
		topic: process.env.TOPIC_KUJI_ORDER_DLQ,
		handler,
	});
};

run();
