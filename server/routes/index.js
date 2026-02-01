module.exports = function (fastify, options, done) {
	// user
	fastify.get('/bad-scenario', require('./bad-scenario-request'));

	done();
};
