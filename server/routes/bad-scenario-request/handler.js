const {
	badScenarioWithDB,
	badScenarioWithMQ,
} = require('../../services/kuji');

module.exports = async function (request, reply) {
	let result = ''

	if (request.query.kind === 'db') {
		result = await badScenarioWithDB();
	} else {
		result = await badScenarioWithMQ();
	}

	reply.status(200).send({ result });
};
