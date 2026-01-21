const pino = require('pino');

let logger = null;

module.exports = function (config) {
	if (logger !== null) {
		return logger;
	}

	logger = pino({
		redact: config.redact,
		base: false,
		errorKey: 'error',
		timestamp: pino.stdTimeFunctions.isoTime,
		level: config.level,
		mixin(_context, level) {
			return { 'label': logger.levels.labels[level] };
		},
		transport: {
			targets: [
				{
					target: 'pino/file',
					options: {
						destination: 1,
					},
				},
			],
			dedupe: true,
			sync: true,
		},
	});

	return logger;
};
