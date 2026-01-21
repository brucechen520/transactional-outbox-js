const KujiOrderModel = require('../models/kuji-order');

async function drop() {
	await KujiOrderModel.sync({ force: true });
}

exports.drop = drop;
