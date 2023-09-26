"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    verifyRecaptcha: function() {
        return verifyRecaptcha;
    },
    verifyHcaptcha: function() {
        return verifyHcaptcha;
    }
});
const _url = require("url");
const _fetch = require("./fetch");
const _config = require("../config");
async function verifyRecaptcha(secret, response) {
    const result = await getCaptchaResponse('https://www.recaptcha.net/recaptcha/api/siteverify', secret, response).catch((e)=>{
        throw `recaptcha-request-failed: ${e}`;
    });
    if (result.success !== true) {
        var _result_errorcodes;
        const errorCodes = result['error-codes'] ? (_result_errorcodes = result['error-codes']) === null || _result_errorcodes === void 0 ? void 0 : _result_errorcodes.join(', ') : '';
        throw `recaptcha-failed: ${errorCodes}`;
    }
}
async function verifyHcaptcha(secret, response) {
    const result = await getCaptchaResponse('https://hcaptcha.com/siteverify', secret, response).catch((e)=>{
        throw `hcaptcha-request-failed: ${e}`;
    });
    if (result.success !== true) {
        var _result_errorcodes;
        const errorCodes = result['error-codes'] ? (_result_errorcodes = result['error-codes']) === null || _result_errorcodes === void 0 ? void 0 : _result_errorcodes.join(', ') : '';
        throw `hcaptcha-failed: ${errorCodes}`;
    }
}
async function getCaptchaResponse(url, secret, response) {
    const params = new _url.URLSearchParams({
        secret,
        response
    });
    const res = await (0, _fetch.getResponse)({
        url,
        method: 'POST',
        body: params.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': _config.default.userAgent
        },
        timeout: 10 * 1000
    }).catch((e)=>{
        throw `${e.message || e}`;
    });
    return await JSON.parse(res.body);
}

//# sourceMappingURL=captcha.js.map
