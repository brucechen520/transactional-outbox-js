// lib/errors/ApiError.js
class ApiError extends Error {
	constructor(code, message, statusCode = 400, details = null) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;           // 業務自定義代碼 (如: ORDER_LIMIT_EXCEEDED)
		this.statusCode = statusCode; // HTTP 狀態碼
		this.details = details;     // 存放如 AJV 驗證失敗的陣列
		this.isOperational = true;  // 用於區分「預期內錯誤」與「程式 Bug」
		Error.captureStackTrace(this, this.constructor);
	}

	// 靜態工廠方法：讓你在 Service 寫起來像讀句子一樣
	static BadRequest(message, code = 'BAD_REQUEST', details = null) {
		return new ApiError(code, message, 400, details);
	}

	static Unauthorized(message = '請先登入') {
		return new ApiError('UNAUTHORIZED', message, 401);
	}

	static Forbidden(message = '權限不足') {
		return new ApiError('FORBIDDEN', message, 403);
	}

	static NotFound(message = '找不到該項資源') {
		return new ApiError('NOT_FOUND', message, 404);
	}

	static Internal(message = '伺服器內部錯誤') {
		return new ApiError('INTERNAL_ERROR', message, 500);
	}
}

module.exports = ApiError;
