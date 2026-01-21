const { initDB } = require('../../utils/db/initializer');

module.exports = async function () {
	try {
		await initDB();

		// require('../models/association');

		await require('./fixture-outboxes').drop();
		await require('./fixture-kujis').drop();

		await require('./fixture-outboxes').init();
		await require('./fixture-kujis').init();

	} catch (error) {
		console.log(error);
	}
};
