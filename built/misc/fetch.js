"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getJson: function() {
        return getJson;
    },
    getHtml: function() {
        return getHtml;
    },
    getResponse: function() {
        return getResponse;
    },
    httpAgent: function() {
        return httpAgent;
    },
    httpsAgent: function() {
        return httpsAgent;
    },
    getAgentByUrl: function() {
        return getAgentByUrl;
    },
    StatusError: function() {
        return StatusError;
    }
});
const _http = require("http");
const _https = require("https");
const _dns = require("./dns");
const _got = require("got");
const _httpproxyagent = require("http-proxy-agent");
const _httpsproxyagent = require("https-proxy-agent");
const _config = require("../config");
const _checkprivateip = require("./check-private-ip");
const _checkallowedurl = require("./check-allowed-url");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
async function getJson(url, accept = 'application/json, */*', timeout = 10000, headers) {
    const res = await getResponse({
        url,
        method: 'GET',
        headers: objectAssignWithLcKey({
            'User-Agent': _config.default.userAgent,
            Accept: accept
        }, headers || {}),
        timeout
    });
    if (res.body.length > 65536) throw new Error('too large JSON');
    return await JSON.parse(res.body);
}
async function getHtml(url, accept = 'text/html, */*', timeout = 10000, headers) {
    const res = await getResponse({
        url,
        method: 'GET',
        headers: objectAssignWithLcKey({
            'User-Agent': _config.default.userAgent,
            Accept: accept
        }, headers || {}),
        timeout
    });
    return await res.body;
}
const RESPONSE_TIMEOUT = 30 * 1000;
const OPERATION_TIMEOUT = 60 * 1000;
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
async function getResponse(args) {
    if (!(0, _checkallowedurl.checkAllowedUrl)(args.url)) {
        throw new StatusError('Invalid URL', 400);
    }
    const timeout = args.timeout || RESPONSE_TIMEOUT;
    const operationTimeout = args.timeout ? args.timeout * 6 : OPERATION_TIMEOUT;
    const req = (0, _got.default)(args.url, {
        method: args.method,
        headers: args.headers,
        body: args.body,
        timeout: {
            lookup: timeout,
            connect: timeout,
            secureConnect: timeout,
            socket: timeout,
            response: timeout,
            send: timeout,
            request: operationTimeout
        },
        agent: {
            http: httpAgent,
            https: httpsAgent
        },
        http2: false,
        retry: 0
    });
    req.on('redirect', (res, opts)=>{
        if (!(0, _checkallowedurl.checkAllowedUrl)(opts.url)) {
            req.cancel(`Invalid url: ${opts.url}`);
        }
    });
    return await receiveResponce(req, args.size || MAX_RESPONSE_SIZE);
}
/**
 * Receive response (with size limit)
 * @param req Request
 * @param maxSize size limit
 */ async function receiveResponce(req, maxSize) {
    req.on('response', (res)=>{
        if ((0, _checkprivateip.checkPrivateIp)(res.ip)) {
            req.cancel(`Blocked address: ${res.ip}`);
        }
    });
    // 応答ヘッダでサイズチェック
    req.on('response', (res)=>{
        const contentLength = res.headers['content-length'];
        if (contentLength != null) {
            const size = Number(contentLength);
            if (size > maxSize) {
                req.cancel(`maxSize exceeded (${size} > ${maxSize}) on response`);
            }
        }
    });
    // 受信中のデータでサイズチェック
    req.on('downloadProgress', (progress)=>{
        if (progress.transferred > maxSize && progress.percent !== 1) {
            req.cancel(`maxSize exceeded (${progress.transferred} > ${maxSize}) on response`);
        }
    });
    // 応答取得 with ステータスコードエラーの整形
    const res = await req.catch((e)=>{
        if (e instanceof _got.HTTPError) {
            throw new StatusError(`${e.response.statusCode} ${e.response.statusMessage}`, e.response.statusCode, e.response.statusMessage);
        } else {
            throw e;
        }
    });
    return res;
}
function lcObjectKey(src) {
    const dst = {};
    for (const key of Object.keys(src).filter((x)=>x != '__proto__' && typeof src[x] === 'string'))dst[key.toLowerCase()] = src[key];
    return dst;
}
function objectAssignWithLcKey(a, b) {
    return Object.assign(lcObjectKey(a), lcObjectKey(b));
}
/**
 * Get http non-proxy agent
 */ const _http1 = new _http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: _dns.lookup
});
/**
 * Get https non-proxy agent
 */ const _https1 = new _https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: _dns.lookup
});
const httpAgent = _config.default.proxy ? new _httpproxyagent.HttpProxyAgent(_config.default.proxy) : _http1;
const httpsAgent = _config.default.proxy ? new _httpsproxyagent.HttpsProxyAgent(_config.default.proxy) : _https1;
function getAgentByUrl(url, bypassProxy = false) {
    if (bypassProxy) {
        return url.protocol == 'http:' ? _http1 : _https1;
    } else {
        return url.protocol == 'http:' ? httpAgent : httpsAgent;
    }
}
let StatusError = class StatusError extends Error {
    constructor(message, statusCode, statusMessage){
        super(message);
        _define_property(this, "statusCode", void 0);
        _define_property(this, "statusMessage", void 0);
        _define_property(this, "isClientError", void 0);
        this.name = 'StatusError';
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.isClientError = typeof this.statusCode === 'number' && this.statusCode >= 400 && this.statusCode < 500;
    }
};

//# sourceMappingURL=fetch.js.map
