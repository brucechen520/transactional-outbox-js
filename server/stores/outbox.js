const { OutboxModel } = require('../models');
const { ENUM_OUTBOX_STATUS } = require('../lib/enum');

function createOutbox(data, { transaction }) {
	return OutboxModel.create(data, { transaction });
}

function getPendingOutboxByTopic(topic, {
	raw = true,
	attributes,
	transaction,
	limit = 100,
} = {}) {
	return OutboxModel.findAll({
		where: {
			topic,
			status: ENUM_OUTBOX_STATUS.PENDING,
		},
		raw,
		attributes,
		transaction,
		limit,
	});
}

async function setPendingOutboxToProcessingById(id, {
	transaction,
}) {
	return OutboxModel.update({
		status: ENUM_OUTBOX_STATUS.PROCESSING,
	}, {
		where: {
			id,
			status: ENUM_OUTBOX_STATUS.PENDING,
		},
		transaction,
	})
}

async function updateOutboxStatusByIds(ids, status, { transaction } = {}) {
	if (!ids || ids.length === 0) {
		return [0];
	}

	return OutboxModel.update({
		status,
	}, {
		where: {
			id: ids,
		},
		transaction,
	});
}

module.exports = {
	createOutbox,
	getPendingOutboxByTopic,
	setPendingOutboxToProcessingById,
	updateOutboxStatusByIds,
};
