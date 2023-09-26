"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    logger: function() {
        return logger;
    },
    geoIpLookup: function() {
        return geoIpLookup;
    }
});
const _logger = require("./logger");
const _config = require("../config");
const _fetch = require("../misc/fetch");
const logger = new _logger.default('instanceinfo', 'cyan');
let nextResetTime = 0;
async function geoIpLookup(ip) {
    // 抑制中？
    if (Date.now() < nextResetTime) {
        throw `suspended until ${nextResetTime}`;
    }
    if (ip == null) throw 'invalid ip';
    const url = `http://ip-api.com/json/${ip}`;
    const res = await (0, _fetch.getResponse)({
        url,
        method: 'GET',
        headers: {
            'User-Agent': _config.default.userAgent
        },
        timeout: 10 * 1000,
        size: 10 * 1024 * 1024
    });
    // 残りリクエストのチェック
    const rl = Number(res.headers['x-rl']);
    const ttl = Number(res.headers['x-ttl']);
    if (rl === 0) {
        nextResetTime = Date.now() + ttl * 1000;
    }
    const json = await JSON.parse(res.body);
    if (json.status !== 'success') {
        throw json.message;
    }
    return {
        cc: json.countryCode,
        isp: json.isp,
        org: json.org,
        as: json.as
    };
}

//# sourceMappingURL=geoip.js.map
