const {
	ENUM_USER_TYPE,
} = require('../../../lib/enum');

module.exports = [
	{
		id: 1,
		tenantId: 1,
		username: 'root',
		type: ENUM_USER_TYPE.ROOT,
		secret: 'ZOzx2/dpTkb87yq/o6tdtnCpM113ZQe8gp4TPUxqgow=',
	},
	{
		id: 2,
		tenantId: 1,
		username: 'defaultagent',
		type: ENUM_USER_TYPE.ZHAOSHANG,
		secret: 'ZOzx2/dpTkb87yq/o6tdtnCpM113ZQe8gp4TPUxqgow=',
	},
	{
		id: 3,
		tenantId: 1,
		username: 'test01',
		type: ENUM_USER_TYPE.AGENT,
		secret: 'ZOzx2/dpTkb87yq/o6tdtnCpM113ZQe8gp4TPUxqgow=',
	},
	{
		id: 4,
		tenantId: 1,
		username: 'test0301',
		type: ENUM_USER_TYPE.AGENT,
		secret: 'ZOzx2/dpTkb87yq/o6tdtnCpM113ZQe8gp4TPUxqgow=',
	},
];
