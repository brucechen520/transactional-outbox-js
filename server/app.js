module.exports = function (fastify) {
	require('../utils/fastify/plugins')(fastify);
	require('./lib/ajv-schemas')(fastify);

	fastify.register(require('./routes'), { prefix: '/api/v1' });
};
