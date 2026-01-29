module.exports = function (fastify) {
	require('../utils/fastify/plugins')(fastify);

	fastify.register(require('./routes'), { prefix: '/api/v1' });
};
