const { init } = require('../utils/db');

require('dotenv').config();

async function testConnection() {
	try {
		const sequelize = await init();



	} catch (error) {
		console.error('Unable to connect to the database:', error);
		process.exit(1);
	}
}

testConnection();
