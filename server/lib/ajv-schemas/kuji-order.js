module.exports = {
	$id: 'kujiOrder',
	type: 'object',
	properties: {
		id: {
			type: 'integer',
		},
		userId: {
			type: 'integer',
		},
		prizeName: {
			type: 'string',
		},
		createdAt: {
			$ref: 'common#/properties/createdAt',
		},
		updatedAt: {
			$ref: 'common#/properties/updatedAt',
		},
	},
};
