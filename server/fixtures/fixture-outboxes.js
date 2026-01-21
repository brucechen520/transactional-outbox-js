const OutboxModel = require('../models/outbox');

async function drop() {
	await OutboxModel.sync({ force: true });
}

exports.drop = drop;
