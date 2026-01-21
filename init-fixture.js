require('dotenv').config();

const logger = require('./utils/pino')({
	level: 'debug',
	prettyPrint: false,
});

require('./server/fixtures')().then(() => {
	logger.info('fixtures done');

	process.exit(0);
});
