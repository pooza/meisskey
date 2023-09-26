"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    incrementAndCheck: function() {
        return incrementAndCheck;
    },
    default: function() {
        return _default;
    }
});
const _asyncratelimiter = require("async-ratelimiter");
const _redis = require("../../db/redis");
const _logger = require("../../services/logger");
const _addrtopeer = require("../../misc/addr-to-peer");
const logger = new _logger.default('limiter');
async function incrementAndCheck(endpoint, user, ip) {
    if (_redis.default == null) return; // OK (Limiter DB unavailable)
    const limitation = endpoint.meta.limit;
    if (limitation == null) return; // OK (Limit undefined)
    // Prepare limiter
    const target = genTargetKey(user, ip);
    const key = genEpKey(endpoint);
    // Check min interval (minimum attempt interval)
    if (typeof limitation.minInterval === 'number') {
        const limiter = new _asyncratelimiter({
            db: _redis.default,
            duration: limitation.minInterval,
            max: 1
        });
        const info = await limiter.get({
            id: `${target}:${key}:min`
        });
        logger.debug(`${target} ${key} min remaining: ${info.remaining}`);
        if (info.remaining === 0) throw new Error('BRIEF_REQUEST_INTERVAL');
    }
    // Check max interval (general per-sec interval)
    if (typeof limitation.duration === 'number' && typeof limitation.max === 'number') {
        const limiter = new _asyncratelimiter({
            db: _redis.default,
            duration: limitation.duration,
            max: limitation.max
        });
        const info = await limiter.get({
            id: `${target}:${key}`
        });
        logger.debug(`${target} ${key} max remaining: ${info.remaining}`);
        if (info.remaining === 0) throw new Error('RATE_LIMIT_EXCEEDED');
    }
    return; // OK (Passed all checks)
}
/**
 * Generate target key
 */ function genTargetKey(user, ip) {
    if (user) return user._id;
    var _addrToPeer;
    if (ip) return (_addrToPeer = (0, _addrtopeer.addrToPeer)(ip)) !== null && _addrToPeer !== void 0 ? _addrToPeer : null;
    return null;
}
/***
 * Generate endpoint key
 */ function genEpKey(endpoint) {
    var _endpoint_meta_limit;
    var _endpoint_meta_limit_key;
    return (_endpoint_meta_limit_key = (_endpoint_meta_limit = endpoint.meta.limit) === null || _endpoint_meta_limit === void 0 ? void 0 : _endpoint_meta_limit.key) !== null && _endpoint_meta_limit_key !== void 0 ? _endpoint_meta_limit_key : endpoint.name;
}
const _default = incrementAndCheck;

//# sourceMappingURL=limiter.js.map
