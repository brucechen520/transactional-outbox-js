const {
	badScenarioWithDB,
	badScenarioWithMQ,
	badScenarioWithConnectionPoolExhaustion,
} = require('../../services/kuji');

module.exports = async function (request, reply) {
	let result = ''

	const { kind } = request.query;

	if (kind === 'db') {
		result = await badScenarioWithDB();
	} else if (kind === 'mq') {
		result = await badScenarioWithMQ();
	} else if (kind === 'connection_pool_exhausted') {
		result = await badScenarioWithConnectionPoolExhaustion();
	}

	reply.status(200).send({ result });
};
