module.exports = {
	$id: 'error',
	type: 'object',
	properties: {
		code: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		details: {
			type: ['array', 'null'],
			items: {
				type: 'object',
				additionalProperties: true,
			},
		}
	},
};
