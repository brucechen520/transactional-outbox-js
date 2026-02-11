const {
	TOPIC_KUJI_ORDER_CREATED,
} = process.env;

module.exports = new Map([
	[TOPIC_KUJI_ORDER_CREATED, require('./relay-kuji-order-created')],
]);