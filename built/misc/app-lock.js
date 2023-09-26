"use strict";
Object.defineProperty(exports, "getApLock", {
    enumerable: true,
    get: function() {
        return getApLock;
    }
});
const _redis = require("../db/redis");
const _util = require("util");
/**
 * Retry delay (ms) for lock acquisition
 */ const retryDelay = 100;
const lock = _redis.default ? (0, _util.promisify)(require('redis-lock')(_redis.default, retryDelay)) : async ()=>()=>{};
function getApLock(uri, timeout = 30 * 1000) {
    return lock(`ap-object:${uri}`, timeout);
}

//# sourceMappingURL=app-lock.js.map
