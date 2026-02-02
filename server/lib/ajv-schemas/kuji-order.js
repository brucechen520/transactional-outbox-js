module.exports = {
	$id: 'kujiOrder',
	type: 'object',
	properties: {
		id: {
			$ref: 'common#/properties/id',
		},
		userId: {
			$ref: 'user#/properties/id',
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
