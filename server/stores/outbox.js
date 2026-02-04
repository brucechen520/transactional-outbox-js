const { OutboxModel } = require('../models');
const { ENUM_OUTBOX_STATUS } = require('../lib/enum');

function createOutbox(data, { transaction }) {
	return OutboxModel.create(data, { transaction });
}

function getPendingOutboxesByTopic(topic, {
	raw = true,
	attributes,
	transaction,
	limit = 50,
	lock,
	skipLocked,
} = {}) {
	return OutboxModel.findAll({
		where: {
			topic,
			status: ENUM_OUTBOX_STATUS.PENDING,
		},
		order: [
			['id', 'ASC'],
		],
		raw,
		attributes,
		transaction,
		limit,
		lock,
		skipLocked,
	});
}

async function updateOutboxStatusByIds(ids, row, { transaction } = {}) {
	if (!ids || ids.length === 0) {
		return [0];
	}

	return OutboxModel.update(row, {
		where: {
			id: ids,
		},
		transaction,
	});
}

module.exports = {
	createOutbox,
	getPendingOutboxesByTopic,
	updateOutboxStatusByIds,
};
