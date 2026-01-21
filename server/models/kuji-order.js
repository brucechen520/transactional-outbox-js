const { sequelize } = require('sequelize-lib');
const { tableName, schema, options } = require('../schemas/kuji-order');

const model = sequelize.define(tableName, schema, options);

module.exports = model;
