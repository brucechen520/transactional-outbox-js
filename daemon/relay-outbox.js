const Cron = require('croner');
const relayMap = require('./relay');
const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

async function dispatch() {
	logger.info('Relay outbox worker dispatching...');

	const tasks = Array.from(relayMap.entries()).map(async ([ topic, handler ]) => {
		try {
			await handler();
		} catch (error) {
			logger.error({ err: error, topic }, 'Relay handler failed');
		}
	});

	await Promise.all(tasks);

	logger.info('Relay outbox worker finished dispatch.');
}

module.exports = function () {
	logger.info('Starting relay outbox worker...');

	// 每 10 秒執行一次
	Cron('*/10 * * * * *', { name: 'relay-outbox-worker' }, dispatch);
};
