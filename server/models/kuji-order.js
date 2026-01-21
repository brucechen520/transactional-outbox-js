const { getSequelize } = require('../../utils/db');
const { tableName, schema, options } = require('../schemas/kuji-order');

const model = getSequelize().define(tableName, schema, options);

module.exports = model;
