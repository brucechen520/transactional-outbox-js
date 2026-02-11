require('dotenv').config();
const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const startWorker = require('../daemon/consume-worker');

async function run () {
	// 1. 初始化 DB (若 Consumer 邏輯需要查庫)
	await init();

	// 2. 測試 Kafka 連線
	await KafkaClient.testConnection();

	const {
		CONSUME_SHIPPING: handler
	} = require('../consumers');

	startWorker({
		groupId: process.env.GROUP_CONSUME_SHIPPING,
		topic: process.env.TOPIC_KUJI_ORDER_CREATED,
		handler,
	});
};

run();
