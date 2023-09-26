"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createConnection: function() {
        return createConnection;
    },
    redisClient: function() {
        return redisClient;
    },
    default: function() {
        return _default;
    }
});
const _ioredis = require("ioredis");
const _config = require("../config");
function createConnection() {
    return new _ioredis.default({
        port: _config.default.redis.port,
        host: _config.default.redis.host,
        path: _config.default.redis.path,
        family: _config.default.redis.family == null ? 0 : _config.default.redis.family,
        username: _config.default.redis.user,
        password: _config.default.redis.pass,
        keyPrefix: `${_config.default.redis.prefix}:`,
        db: _config.default.redis.db || 0
    });
}
const redisClient = createConnection();
const _default = redisClient;

//# sourceMappingURL=redis.js.map
