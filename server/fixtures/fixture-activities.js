const ActivityModel = require('../models/activity');
const ActivityActivityClassModel = require('../models/activity-activity-class');
const ActivityClassModel = require('../models/activity-class');

async function drop() {
	await ActivityModel.sync({ force: true });
	await ActivityActivityClassModel.sync({ force: true });
	await ActivityClassModel.sync({ force: true });
}

exports.drop = drop;
