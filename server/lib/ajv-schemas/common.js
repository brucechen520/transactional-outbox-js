module.exports = {
	$id: 'common',
	type: 'object',
	properties: {
		id: {
			type: 'integer',
			minimum: 0,
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
};
