module.exports = function (fastify) {
	fastify.register(require('./kafka-plugin'));
};
