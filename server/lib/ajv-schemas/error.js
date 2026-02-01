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
			type: ['string', 'null'],
		}
	},
};
