"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _fetchmeta = require("../../misc/fetch-meta");
const _webpush = require("web-push");
const _config = require("../../config");
const _swsubscription = require("../../models/sw-subscription");
let enabled = false;
function update() {
    (0, _fetchmeta.default)().then((meta)=>{
        if (meta.enableServiceWorker && meta.swPublicKey && meta.swPrivateKey) {
            enabled = true;
            // アプリケーションの連絡先と、サーバーサイドの鍵ペアの情報を登録
            _webpush.setVapidDetails(_config.default.url, meta.swPublicKey, meta.swPrivateKey);
        } else {
            enabled = false;
        }
    });
}
setInterval(()=>{
    update();
}, 30000);
update();
const _default = async (job)=>{
    if (!enabled) return 'skip (not enabled)';
    await _webpush.sendNotification(job.data.pushSubscription, job.data.payload, {
        proxy: _config.default.proxy
    }).catch(async (err)=>{
        if (err instanceof _webpush.WebPushError) {
            if (err.statusCode === 410) {
                await _swsubscription.default.remove({
                    _id: new _mongodb.ObjectID(job.data.swSubscriptionId)
                });
            }
            const msg = `${err.statusCode} ${job.data.pushSubscription.endpoint} ${job.data.payload.length}`;
            // 4xx => no retry, other => retry
            if (err.statusCode >= 400 && err.statusCode <= 499) {
                return `skip (${msg})`;
            } else {
                throw new Error(msg);
            }
        } else {
            throw err;
        }
    });
    return `ok`;
};

//# sourceMappingURL=webpushDeliver.js.map
