"use strict";
Object.defineProperty(exports, "initialize", {
    enumerable: true,
    get: function() {
        return initialize;
    }
});
const _bull = require("bull");
const _config = require("../config");
function initialize(name, limitPerSec = -1) {
    return new _bull(name, _config.default.redis != null ? {
        redis: {
            port: _config.default.redis.port,
            host: _config.default.redis.host,
            path: _config.default.redis.path,
            family: _config.default.redis.family == null ? 0 : _config.default.redis.family,
            username: _config.default.redis.user,
            password: _config.default.redis.pass,
            db: _config.default.redis.db || 0
        },
        prefix: _config.default.redis.prefix ? `${_config.default.redis.prefix}:queue` : 'queue',
        limiter: limitPerSec > 0 ? {
            max: limitPerSec,
            duration: 1000
        } : undefined,
        settings: {
            backoffStrategies: {
                apBackoff
            }
        }
    } : undefined);
}
function apBackoff(attemptsMade, err) {
    const baseDelay = 60 * 1000; // 1min
    const maxBackoff = 8 * 60 * 60 * 1000; // 8hours
    let backoff = (Math.pow(2, attemptsMade) - 1) * baseDelay;
    backoff = Math.min(backoff, maxBackoff);
    backoff += Math.round(backoff * Math.random() * 0.2);
    return backoff;
}

//# sourceMappingURL=initialize.js.map
