const Sequelize = require('sequelize');
// const {
// 	toCipher,
// } = require('./setter');
// const {
// 	toPlaintext,
// } = require('./getter');
const {
	ENUM_USER_STATUS,
	ENUM_USER_TYPE,
} = require('../lib/enum');

const schema = {
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	tenantId: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	type: {
		type: Sequelize.TINYINT.UNSIGNED,
		allowNull: false,
		validate: {
			isIn: [
				Object.values(ENUM_USER_TYPE),
			],
		},
	},
	secret: {
		type: Sequelize.STRING,
		allowNull: false,
		// set: toCipher('secret'),
		// get: toPlaintext('secret'),
	},
	status: {
		type: Sequelize.TINYINT.UNSIGNED,
		allowNull: false,
		defaultValue: ENUM_USER_STATUS.ENABLED,
		validate: {
			isIn: [
				Object.values(ENUM_USER_STATUS),
			],
		},
	},
};

const options = {
	indexes: [
		{
			unique: true,
			fields: ['username'],
		},
		{
			unique: true,
			fields: ['commentId'],
		},
	],
	paranoid: true,
};

module.exports = {
	tableName: 'users',
	schema,
	options,
};
