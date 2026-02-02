const { ENUM_USER_TYPE, ENUM_USER_STATUS } = require('../../lib/enum');

module.exports = {
	$id: 'user',
	type: 'object',
	properties: {
		id: {
			$ref: 'common#/properties/id',
		},
		tenantId: {
			$ref: 'common#/properties/id',
		},
		userName: {
			type: 'string',
		},
		type: {
			type: 'integer',
			enum: Object.values(ENUM_USER_TYPE),
		},
		secret: {
			type: 'string',
		},
		status: {
			type: 'integer',
			enum: Object.values(ENUM_USER_STATUS),
		},
		createdAt: {
			$ref: 'common#/properties/createdAt',
		},
		updatedAt: {
			$ref: 'common#/properties/updatedAt',
		},
	},
};
