class Transaction {
	static sequelize;

	constructor({
		isolationLevel,
	} = {}) {
		this.isolationLevel = isolationLevel;
	}

	async commit(operations) {
		return await Transaction.sequelize.transaction({
			isolationLevel: this.isolationLevel,
		}, operations);
	}
}

module.exports = Transaction;
