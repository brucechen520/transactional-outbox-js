const {
	KUJI_ORDER_CREATED,
} = require('./topic');

module.exports = new Map([
	[KUJI_ORDER_CREATED, require('./relay-kuji-order-created')],
]);