const { ENUM_OUTBOX_STATUS } = require('../../lib/enum');

module.exports = {
	$id: 'outbox',
	type: 'object',
	properties: {
		id: {
			$ref: 'common#/properties/id',
		},
		topic: {
			type: 'string',
		},
		payload: {
			type: 'object',
		},
		status: {
			type: 'integer',
			enum: Object.values(ENUM_OUTBOX_STATUS),
		},
		createdAt: {
			$ref: 'common#/properties/createdAt',
		},
		updatedAt: {
			$ref: 'common#/properties/updatedAt',
		},
	},
};
