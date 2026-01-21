const { getSequelize } = require('./index');

class Transaction {
	constructor({
		sequelize = getSequelize(),
		isolationLevel,
	} = {}) {
		this.isolationLevel = isolationLevel;
		this.sequelize = sequelize;
	}

	async commit(operations) {
		return await this.sequelize.transaction({
			isolationLevel: this.isolationLevel,
		}, operations);
	}
}

module.exports = Transaction;
