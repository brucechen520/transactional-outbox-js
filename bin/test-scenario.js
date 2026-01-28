const { init } = require('../utils/db');
const KafkaClient = require('../utils/kafka/client');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

require('dotenv').config();

async function testConnection() {
	try {
		const sequelize = await init();

		console.log(KafkaClient.getInstance());

		await KafkaClient.testConnection();
	} catch (error) {
		logger.error('Unable to connect to the database:', error);
		process.exit(1);
	}
}

testConnection().catch(logger);
