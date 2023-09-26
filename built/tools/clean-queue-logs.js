"use strict";
const _redis = require("../db/redis");
const _config = require("../config");
async function main() {
    const prefix = _config.default.redis.prefix ? `${_config.default.redis.prefix}:queue` : 'queue';
    const pattern = `${prefix}:*:logs`;
    const keys = await _redis.default.keys(pattern);
    for (const key of keys){
        const queueKey = key.replace(/:logs$/, '');
        const queueExists = await _redis.default.exists(stripPrefix(queueKey));
        if (queueExists) {
            console.log(key, 'skip');
        } else {
            const n = await _redis.default.del(stripPrefix(key));
            console.log(key, `del ${n ? 'OK' : 'NG '}`);
        }
    }
}
function stripPrefix(key) {
    return _config.default.redis.prefix ? key.substring(_config.default.redis.prefix.length + 1) : key;
}
main().then(()=>{
    console.log('Done. Exits after 30 seconds...');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-queue-logs.js.map
