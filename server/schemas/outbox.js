const Sequelize = require('sequelize');
const { ENUM_OUTBOX_STATUS } = require('../lib/enum');
const schema = {
	id: {
		type: Sequelize.BIGINT.UNSIGNED,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	topic: {
		type: Sequelize.STRING,
		allowNull: false,

	},
	payload: {
		type: Sequelize.JSON,
		allowNull: false,
		defaultValue: {},
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: ENUM_OUTBOX_STATUS.PENDING,
		validate: {
			isIn: [
				Object.values(ENUM_OUTBOX_STATUS),
			],
		},
	},
};

const options = {
	indexes: [
	],
};

module.exports = {
	tableName: 'outboxes',
	schema,
	options,
};
