const { createConnection } = require('./connection');

let sequelize = null;

async function init () {
	// singleton pattern
	if (!sequelize) {
		sequelize = await createConnection();
	}

	return sequelize;
}

function getSequelize () {
	if (!sequelize) {
		throw new Error('Sequelize has not been initialized. Please call init() first.');
	}

	return sequelize;
}

module.exports = {
	init,
	getSequelize,
};
