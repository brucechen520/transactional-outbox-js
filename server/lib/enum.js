ENUM_USER_STATUS = Object.freeze({
	ENABLED: 1,
	DISABLED: 2,
});

const ENUM_OUTBOX_STATUS = Object.freeze({
	PENDING: 1,
	PROCESSED: 2,
	FAILED: 3,
	DONE: 4,
});

const ENUM_USER_TYPE = Object.freeze({
	ROOT: 1,
	MANAGER: 2,
	AGENT: 3,
});

module.exports = {
	ENUM_USER_STATUS,
    ENUM_USER_TYPE,
    ENUM_OUTBOX_STATUS,
};
