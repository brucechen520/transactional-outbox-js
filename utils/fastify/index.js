const config = require('config');
const { server: serverConfig, ajv: ajvConfig } = config;
const { errorHandler } = require('./hooks');

const fastify = require('fastify')({
	// 1. 日誌配置：生產環境與開發環境分離
	logger: {
		level: serverConfig.logger.level || 'info',
		// 預設 logger (Pino) 非常快，生產環境建議直接輸出 JSON 供 ELK/Grafana 收集
		transport: serverConfig.logger.prettyPrint && process.env.NODE_ENV !== 'production'
		? { target: 'pino-pretty', options: { colorize: true } }
		: undefined,
	},
	routerOptions: {
		ignoreTrailingSlash: serverConfig.options.ignoreTrailingSlash || true,     // 自動處理 /users 與 /users/ 的差異
	},
	// 2. 請求超時與限制 (防止惡意攻擊或資源耗盡)
	connectionTimeout: serverConfig.options.connectionTimeout || 30000,      // 30秒連線超時
	requestTimeout: serverConfig.options.requestTimeout || 30000,         // 30秒請求處理超時
	bodyLimit: serverConfig.options.bodyLimit || 1048576,            // 限制 Body 大小為 1MB (預設也是 1MB，視業務調整)

	// 3. 安全與效能相關
	disableRequestLogging: serverConfig.options.disableRequestLogging || false,  // 若為了極致效能可設為 true，但建議保留以利除錯

	// 4. 強烈建議：自定義 ID 產生器 (利於分散式追蹤)
	genReqId: (req) => req.headers['x-request-id'] || require('crypto').randomUUID(),

	// 5. 調整 AJV 配置 (Fastify 內建的內容驗證器)
	ajv: {
		customOptions: {
			removeAdditional: ajvConfig.removeAdditional,    // 自動移除 Schema 沒定義的欄位，保護資料庫
			useDefaults: ajvConfig.useDefaults,         // 自動填入 Schema 定義的預設值
			coerceTypes: ajvConfig.coerceTypes,         // 自動轉換型別 (例如 string "1" 轉為 number 1)
		},
	},
});

fastify.setErrorHandler(errorHandler);

module.exports = fastify;
