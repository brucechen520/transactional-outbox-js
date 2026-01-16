const Sequelize = require('sequelize');
const schema = {
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	userId: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
	},
	prizeName: {
		type: Sequelize.STRING,
		allowNull: false,
	},
};

const options = {
	indexes: [
	],
};

module.exports = {
	tableName: 'kuji_orders',
	schema,
	options,
};
