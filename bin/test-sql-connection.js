const { init } = require('../utils/db');

require('dotenv').config();

async function testConnection() {
	try {
		const sequelize = await init();

		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
		process.exit(1);
	}
}

testConnection();
