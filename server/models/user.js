const { getSequelize } = require('../../utils/db');
const { tableName, schema, options } = require('../schemas/user');

const model = getSequelize().define(tableName, schema, options);

module.exports = model;
