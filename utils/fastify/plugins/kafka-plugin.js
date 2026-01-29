// src/plugins/kafka.js
const fp = require('fastify-plugin');
const kafkaClient = require('../../kafka/client');

async function kafkaConnector(fastify, opts) {
	// 裝飾到 fastify 實例
	fastify.decorate('kafka', kafkaClient);

	// 註冊 onClose 生命週期鉤子
	fastify.addHook('onClose', async (instance) => {
		instance.log.info('Kafka 正在執行優雅停機...');

		try {
			// 這裡呼叫我們在 KafkaClient 寫好的斷連邏輯
			await instance.kafka.disconnectAll();

			instance.log.info('✅ Kafka 外部連線已成功關閉');
		} catch (err) {
			instance.log.error('❌ Kafka 關閉時發生錯誤:', err);
		}
	});
}

module.exports = fp(kafkaConnector);
