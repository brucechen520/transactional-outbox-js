const { sequelize } = require('sequelize-lib');
const { tableName, schema, options } = require('../schemas/user');

const model = sequelize.define(tableName, schema, options);

module.exports = model;
