const { OutboxModel } = require('../models');

function createOutbox(data, { transaction }) {
	return OutboxModel.create(data, { transaction });
}

module.exports = {
	createOutbox,
};
