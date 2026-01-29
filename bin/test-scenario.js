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

		console.log(KafkaClient.getInstance());

		await KafkaClient.testConnection();

		const fastify = require('../utils/fastify');

		require('../server/app')(fastify);

		fastify.listen({
			host: serverConfig.host || '127.0.0.1',
			port: serverConfig.port || 3003,
		}).then(() => {
			logger.info(`🚀 Server is running at http://${serverConfig.host}:${serverConfig.port}`);
		}).catch(async (err) => {
			logger.error(`Failed to start server:`, err);

			await KafkaClient.disconnectAll();

			process.exit(1);
		});
	} catch (error) {
		logger.error('Unable to connect to the database:', error);
		process.exit(1);
	}
}

testConnection().catch(logger);
