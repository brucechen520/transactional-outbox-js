const logger = require('../utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

module.exports = async function (payload, metadata) {
	logger.info({ payload, metadata }, 'consume kuji order shipping');
};
