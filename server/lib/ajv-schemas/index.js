module.exports = function (fastify) {
	fastify.addSchema(require('./error'));
	fastify.addSchema(require('./common'));
	fastify.addSchema(require('./kuji-order'));
	fastify.addSchema(require('./outbox'));
	fastify.addSchema(require('./user'));
};
