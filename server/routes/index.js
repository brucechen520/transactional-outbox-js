module.exports = function (fastify, options, done) {
	// scenario
	fastify.get('/bad-scenario', require('./bad-scenario-request'));
	fastify.post('/outbox-scenario', require('./outbox-scenario-create-kuji-order-request'));

	done();
};
