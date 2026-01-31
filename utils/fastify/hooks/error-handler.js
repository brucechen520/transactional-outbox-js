module.exports = function (error, request, reply) {
	if (error.validation) {
		error.statusCode = 422;
	}

	const statusCode = error.statusCode || 500;

	if (statusCode >= 500) {
		request.log.error(error);
	}

	reply.error = error;

	reply.status(statusCode).send({
		code: error.code || 'INTERNAL_ERROR',
		message: error.message,
		details: error.details || null
	});
};
