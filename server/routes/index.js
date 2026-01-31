module.exports = function (fastify, options, done) {
	// user
	fastify.get('/bad-scenario/kind=:kind', require('./bad-scenario-request'));

	done();
};
