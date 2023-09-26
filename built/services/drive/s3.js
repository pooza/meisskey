"use strict";
Object.defineProperty(exports, "getS3Client", {
    enumerable: true,
    get: function() {
        return getS3Client;
    }
});
const _clients3 = require("@aws-sdk/client-s3");
const _nodehttphandler = require("@aws-sdk/node-http-handler");
const _fetch = require("../../misc/fetch");
function getS3Client(drive) {
    if (drive.config == null) throw 'drive.config is null';
    // dummy for selecting agent
    const h = drive.config.endPoint || 'example.net';
    const bypassProxy = drive.config.useProxy === undefined ? false : !drive.config.useProxy;
    const config = {
        endpoint: drive.config.endPoint ? `${drive.config.useSSL ? 'https://' : 'http://'}${drive.config.endPoint}` : undefined,
        credentials: {
            accessKeyId: drive.config.accessKey,
            secretAccessKey: drive.config.secretKey
        },
        region: drive.config.region || undefined,
        tls: drive.config.useSSL,
        forcePathStyle: !drive.config.endPoint // AWS with endPoint omitted
         ? false : drive.config.s3ForcePathStyle == null ? true : !!drive.config.s3ForcePathStyle,
        requestHandler: new _nodehttphandler.NodeHttpHandler({
            httpAgent: (0, _fetch.getAgentByUrl)(new URL(`http://${h}`), bypassProxy),
            httpsAgent: (0, _fetch.getAgentByUrl)(new URL(`https://${h}`), bypassProxy),
            connectionTimeout: 10 * 1000,
            socketTimeout: 30 * 1000
        })
    };
    return new _clients3.S3Client(config);
}

//# sourceMappingURL=s3.js.map
