const UserModel = require('../models/user');
const creatingUsers = require('./data/user');

async function create() {
	await UserModel.bulkCreate(creatingUsers);
};

async function drop() {
	await UserModel.sync({ force: true });
}

exports.create = create;
exports.drop = drop;
