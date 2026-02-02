const { UserModel } = require('../models');

function getUserById(id, {
	raw = true,
	attributes,
	transaction,
} = {}) {
	return UserModel.findOne({
		where: {
			id,
		},
		raw,
		attributes,
		transaction,
	});
}

module.exports = {
	getUserById,
};
