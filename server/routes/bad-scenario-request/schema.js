module.exports = {
	querystring: {
		type: 'object',
		properties: {
			kind: {
				type: 'string',
				enum: ['db', 'mq'],
				default: 'db',
			},
		},
	},
	response: {
		default: {
			$ref: 'error#',
		},
		200: {
			type: 'object',
			properties: {
				result: {
					type: 'string',
				},
			},
		},
	},
};
