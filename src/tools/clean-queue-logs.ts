import redis from '../db/redis';
import config from '../config';

async function main() {
	const prefix = config.redis.prefix ? `${config.redis.prefix}:queue` : 'queue';
	const pattern = `${prefix}:*:logs`;
	const keys = await redis.keys(pattern);
	for (const key of keys) {
		// keyPrefix消さないといけない
		const k = config.redis.prefix ? key.substring(config.redis.prefix.length + 1) : key;
		const n = await redis.del(k);
		console.log(k, n);
	}
}

main().then(() => {
	console.log('Done');
	setTimeout(() => {
		process.exit(0);
	}, 30 * 1000);
});
