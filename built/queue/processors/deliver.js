"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _request = require("../../remote/activitypub/request");
const _registerorfetchinstancedoc = require("../../services/register-or-fetch-instance-doc");
const _instance = require("../../models/instance");
const _instance1 = require("../../services/chart/instance");
const _logger = require("../../services/logger");
const _updateinstanceinfo = require("../../services/update-instanceinfo");
const _instancemoderation = require("../../services/instance-moderation");
const _serverevent = require("../../services/server-event");
const _fetch = require("../../misc/fetch");
const _config = require("../../config");
const logger = new _logger.default('deliver');
const _default = async (job)=>{
    var _job_data_to;
    if (!((_job_data_to = job.data.to) === null || _job_data_to === void 0 ? void 0 : _job_data_to.match(/^https?:/))) {
        return 'skip (invalid URL)';
    }
    const { host } = new URL(job.data.to);
    // ブロック/閉鎖してたら中断
    if (await (0, _instancemoderation.isBlockedHost)(host)) {
        return 'skip (blocked)';
    }
    if (await (0, _instancemoderation.isClosedHost)(host)) {
        return 'skip (closed)';
    }
    if (await (0, _instancemoderation.isSelfSilencedHost)(host)) {
        job.data.content = publicToHome(job.data.content, job.data.user);
    }
    try {
        var _res;
        const res = await (0, _request.default)(job.data.user, job.data.to, job.data.content);
        // Update stats
        (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(host).then((i)=>{
            _instance.default.update({
                _id: i._id
            }, {
                $set: {
                    latestRequestSentAt: new Date(),
                    latestStatus: 200,
                    lastCommunicatedAt: new Date(),
                    isNotResponding: false
                }
            });
            (0, _updateinstanceinfo.UpdateInstanceinfo)(i);
            _instance1.default.requestSent(i.host, true);
        });
        return `ok: ${(_res = res) === null || _res === void 0 ? void 0 : _res.substring(0, 256)}`;
    } catch (res) {
        // Update stats
        (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(host).then((i)=>{
            _instance.default.update({
                _id: i._id
            }, {
                $set: {
                    latestRequestSentAt: new Date(),
                    latestStatus: res instanceof _fetch.StatusError ? res.statusCode : null,
                    isNotResponding: true
                }
            });
            _instance1.default.requestSent(i.host, false);
        });
        if (res instanceof _fetch.StatusError) {
            // 4xx
            if (res.isClientError) {
                var _job_data_inboxInfo;
                // Mastodonから返ってくる401がどうもpermanent errorじゃなさそう
                if (res.statusCode === 401) {
                    throw `${res.statusCode} ${res.statusMessage}`;
                }
                // sharedInboxで410を返されたら閉鎖済みとマークする
                if (res.statusCode === 410 && ((_job_data_inboxInfo = job.data.inboxInfo) === null || _job_data_inboxInfo === void 0 ? void 0 : _job_data_inboxInfo.origin) === 'sharedInbox') {
                    logger.info(`${host}: MarkedAsClosed (sharedInbox:410)`);
                    (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(host).then((i)=>{
                        _instance.default.update({
                            _id: i._id
                        }, {
                            $set: {
                                isMarkedAsClosed: true
                            }
                        }).then(()=>{
                            (0, _serverevent.publishInstanceModUpdated)();
                        });
                    });
                }
                // HTTPステータスコード4xxはクライアントエラーであり、それはつまり
                // 何回再送しても成功することはないということなのでエラーにはしないでおく
                return `${res.statusCode} ${res.statusMessage}`;
            }
        }
        throw res;
    }
};
function publicToHome(content, user) {
    if (content.type === 'Create' && content.object.type === 'Note') {
        const asPublic = 'https://www.w3.org/ns/activitystreams#Public';
        const followers = `${_config.default.url}/users/${user._id}/followers`;
        if (content.to.includes(asPublic)) {
            content.to = content.to.filter((x)=>x !== asPublic);
            content.to = content.to.concat(followers);
            content.cc = content.cc.filter((x)=>x !== followers);
            content.cc = content.cc.concat(asPublic);
        }
        if (content.object.to.includes(asPublic)) {
            content.object.to = content.object.to.filter((x)=>x !== asPublic);
            content.object.to = content.object.to.concat(followers);
            content.object.cc = content.object.cc.filter((x)=>x !== followers);
            content.object.cc = content.object.cc.concat(asPublic);
        }
        return content;
    } else {
        return content;
    }
}

//# sourceMappingURL=deliver.js.map
