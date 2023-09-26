"use strict";
Object.defineProperty(exports, "downloadUrl", {
    enumerable: true,
    get: function() {
        return downloadUrl;
    }
});
const _fs = require("fs");
const _stream = require("stream");
const _util = require("util");
const _got = require("got");
const _fetch = require("./fetch");
const _config = require("../config");
const _logger = require("../services/logger");
const _checkprivateip = require("./check-private-ip");
const _checkallowedurl = require("./check-allowed-url");
const pipeline = _util.promisify(_stream.pipeline);
async function downloadUrl(url, path) {
    if (!(0, _checkallowedurl.checkAllowedUrl)(url)) {
        throw new _fetch.StatusError('Invalid URL', 400);
    }
    const logger = new _logger.default('download-url');
    logger.info(`Downloading ${url} ...`);
    const timeout = 30 * 1000;
    const operationTimeout = 60 * 1000;
    const maxSize = _config.default.maxFileSize || 262144000;
    const req = _got.default.stream(url, {
        headers: {
            'User-Agent': _config.default.userAgent
        },
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
            http: _fetch.httpAgent,
            https: _fetch.httpsAgent
        },
        http2: false,
        retry: 0
    }).on('redirect', (res, opts)=>{
        if (!(0, _checkallowedurl.checkAllowedUrl)(opts.url)) {
            logger.warn(`Invalid URL: ${opts.url}`);
            req.destroy();
        }
    }).on('response', (res)=>{
        if ((0, _checkprivateip.checkPrivateIp)(res.ip)) {
            logger.warn(`Blocked address: ${res.ip}`);
            req.destroy();
        }
        const contentLength = res.headers['content-length'];
        if (contentLength != null) {
            const size = Number(contentLength);
            if (size > maxSize) {
                logger.warn(`maxSize exceeded (${size} > ${maxSize}) on response`);
                req.destroy();
            }
        }
    }).on('downloadProgress', (progress)=>{
        if (progress.transferred > maxSize && progress.percent !== 1) {
            logger.warn(`maxSize exceeded (${progress.transferred} > ${maxSize}) on downloadProgress`);
            req.destroy();
        }
    });
    try {
        await pipeline(req, _fs.createWriteStream(path));
    } catch (e) {
        if (e instanceof _got.HTTPError) {
            throw new _fetch.StatusError(`${e.response.statusCode} ${e.response.statusMessage}`, e.response.statusCode, e.response.statusMessage);
        } else {
            throw e;
        }
    }
    logger.succ(`Download finished: ${url}`);
}

//# sourceMappingURL=download-url.js.map
