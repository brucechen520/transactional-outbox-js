const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

module.exports = async function (payload, metadata) {
	logger.warn({ payload, metadata }, 'consume kuji order dead letter');
};