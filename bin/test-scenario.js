const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

require('dotenv').config();

const serverConfig = require('config').get('server');

async function testConnection() {
	try {
		const sequelize = await init();

		await KafkaClient.testConnection();

		const fastify = require('../utils/fastify');

		require('../server/app')(fastify);

		fastify.listen({
			host: serverConfig.host || '127.0.0.1',
			port: serverConfig.port || 3003,
		}).then(() => {
			logger.info(`🚀 Server is running at http://${serverConfig.host}:${serverConfig.port}`);
		}).catch(async (err) => {
			logger.error({ err }, 'Failed to start server:');

			await fastify.close();

			process.exit(1);
		});

		// 監聽系統中斷訊號
		['SIGINT', 'SIGTERM'].forEach((signal) => {
			process.on(signal, async () => {
			fastify.log.warn(`收到 ${signal} 訊號，準備關閉服務...`);

			try {
				// 呼叫此方法會觸發所有插件中的 onClose 鉤子
				await fastify.close();
				fastify.log.info('👋 服務已完全關閉');
				process.exit(0);
			} catch (err) {
				fastify.log.error({ err }, '關閉服務時發生錯誤:');
				process.exit(1);
			}
			});
		});
	} catch (error) {
		console.log(error);

		// logger.error('Unable to connect to the database:', text);
		process.exit(1);
	}
}

testConnection().catch(logger);
