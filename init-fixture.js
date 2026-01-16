require('./server/fixtures')().then(() => {
	logger.info('fixtures done');

	process.exit(0);
});
