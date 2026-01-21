const { init } = require('../../utils/db');

module.exports = async function () {
	try {
		require('dotenv').config();

		await init();

		// require('../models/association');

		await require('./fixture-outboxes').drop();
		await require('./fixture-kujis').drop();
		await require('./fixture-users').drop();

		await require('./fixture-users').create();

	} catch (error) {
		console.log(error);
	}
};
