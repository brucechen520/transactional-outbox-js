const {
	createKujiOrder,
} = require('../../services/kuji');

module.exports = async function (request, reply) {
	const {
		userId,
		prizeName,
	} = request.body;

	const result = await createKujiOrder({
		requestId: request.id,
		userId,
		prizeName,
	});

	request.log.info('Outbox Successfully Write');

	reply.status(201).send(result);
};
