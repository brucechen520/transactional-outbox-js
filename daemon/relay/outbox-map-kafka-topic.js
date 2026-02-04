const {
	KUJI_ORDER_CREATED
} = require('./outbox-topic');
const KUJI_ORDER_SHIPPING = 'kuji-order-shipping';
const KUJI_ORDER_CREATED_NOTIFY = 'kuji-order-created-notify';

module.exports = new Map([
	[KUJI_ORDER_CREATED, [
		KUJI_ORDER_SHIPPING,
		KUJI_ORDER_CREATED_NOTIFY,
	]],
]);
