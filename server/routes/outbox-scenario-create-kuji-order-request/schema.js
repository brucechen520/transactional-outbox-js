module.exports = {
	body: {
		type: 'object',
		properties: {
			userId: {
				$ref: 'common#/properties/id',
			},
			prizeName: {
				type: 'string',
			},
		},
	},
	response: {
		default: {
			$ref: 'error#',
		},
		201: {
			type: 'object',
			properties: {
				id: {
					$ref: 'kujiOrder#/properties/id',
				},
				userId: {
					$ref: 'kujiOrder#/properties/userId',
				},
				prizeName: {
					$ref: 'kujiOrder#/properties/prizeName',
				},
				createdAt: {
					$ref: 'kujiOrder#/properties/createdAt',
				},
				updatedAt: {
					$ref: 'kujiOrder#/properties/updatedAt',
				},
			},
		},
	},
};
