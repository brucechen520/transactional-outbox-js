// scripts/demo-exhaustion.js
const axios = require('axios');

async function runDemo() {
	console.log("🚀 同時發起 3 個請求 (但連線池上限只有 2)...");

	const tasks = [1, 2, 3].map(id => {
		const start = Date.now();
		return axios.get('http://localhost:3000/api/v1/bad-scenario?kind=connection_pool_exhausted')
			.then(() => console.log(`✅ 請求 ${id} 成功 (耗時: ${Date.now() - start}ms)`))
			.catch(err => {
				const duration = Date.now() - start;
				console.error(`❌ 請求 ${id} 失敗 (耗時: ${duration}ms): ${err.response?.data?.message || err.message}`);
			});
	});

	await Promise.all(tasks);
}

runDemo();