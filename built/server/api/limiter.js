"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _ratelimiter = require("ratelimiter");
const _redis = require("../../db/redis");
const _render = require("../../misc/acct/render");
const _logger = require("../../services/logger");
const _addrtopeer = require("../../misc/addr-to-peer");
const logger = new _logger.default('limiter');
const _default = (endpoint, user, ip)=>new Promise((ok, reject)=>{
        // Redisがインストールされてない場合は常に許可
        if (_redis.default == null) {
            ok();
            return;
        }
        const limitation = endpoint.meta.limit;
        if (limitation == null) {
            ok();
            return;
        }
        const target = user ? user._id : ip ? (0, _addrtopeer.addrToPeer)(ip) : null;
        const targetName = user ? `@${(0, _render.default)(user)}` : ip ? (0, _addrtopeer.addrToPeer)(ip) : null;
        const key = limitation.hasOwnProperty('key') ? limitation.key : endpoint.name;
        const hasShortTermLimit = limitation.hasOwnProperty('minInterval');
        const hasLongTermLimit = limitation.hasOwnProperty('duration') && limitation.hasOwnProperty('max');
        if (hasShortTermLimit) {
            min();
        } else if (hasLongTermLimit) {
            max();
        } else {
            ok();
        }
        // Short-term limit
        function min() {
            const minIntervalLimiter = new _ratelimiter({
                id: `${target}:${key}:min`,
                duration: limitation.minInterval,
                max: 1,
                db: _redis.default
            });
            minIntervalLimiter.get((err, info)=>{
                if (err) {
                    return reject('ERR');
                }
                logger.debug(`${targetName} ${endpoint.name} min remaining: ${info.remaining}`);
                if (info.remaining === 0) {
                    reject('BRIEF_REQUEST_INTERVAL');
                } else {
                    if (hasLongTermLimit) {
                        max();
                    } else {
                        ok();
                    }
                }
            });
        }
        // Long term limit
        function max() {
            const limiter = new _ratelimiter({
                id: `${target}:${key}`,
                duration: limitation.duration,
                max: limitation.max,
                db: _redis.default
            });
            limiter.get((err, info)=>{
                if (err) {
                    return reject('ERR');
                }
                logger.debug(`${targetName} ${endpoint.name} max remaining: ${info.remaining}`);
                if (info.remaining === 0) {
                    reject('RATE_LIMIT_EXCEEDED');
                } else {
                    ok();
                }
            });
        }
    });

//# sourceMappingURL=limiter.js.map
