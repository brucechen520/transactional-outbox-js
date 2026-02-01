const { KujiOrderModel } = require('../models');

function createKujiOrder(data, { transaction } = {}) {
	return KujiOrderModel.create(data, { transaction });
}

module.exports = {
	createKujiOrder,
};
