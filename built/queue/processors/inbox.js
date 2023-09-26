"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    // ユーザーのinboxにアクティビティが届いた時の処理
    default: function() {
        return _default;
    },
    tryProcessInbox: function() {
        return tryProcessInbox;
    }
});
const _httpsignature = require("http-signature");
const _perform = require("../../remote/activitypub/perform");
const _person = require("../../remote/activitypub/models/person");
const _ = require("punycode/");
const _url = require("url");
const _logger = require("../../services/logger");
const _registerorfetchinstancedoc = require("../../services/register-or-fetch-instance-doc");
const _instance = require("../../models/instance");
const _instance1 = require("../../services/chart/instance");
const _type = require("../../remote/activitypub/type");
const _updateinstanceinfo = require("../../services/update-instanceinfo");
const _instancemoderation = require("../../services/instance-moderation");
const _resolver = require("../../remote/activitypub/resolver");
const _dbresolver = require("../../remote/activitypub/db-resolver");
const _util = require("util");
const _converthost = require("../../misc/convert-host");
const _ldsignature = require("../../remote/activitypub/misc/ld-signature");
const _resolveuser = require("../../remote/resolve-user");
const _config = require("../../config");
const _serverevent = require("../../services/server-event");
const _fetch = require("../../misc/fetch");
const logger = new _logger.default('inbox');
const _default = async (job)=>{
    return await tryProcessInbox(job.data);
};
const tryProcessInbox = async (data, ctx)=>{
    var _ctx, _ctx1;
    const signature = data.signature;
    const activity = data.activity;
    const resolver = ((_ctx = ctx) === null || _ctx === void 0 ? void 0 : _ctx.resolver) || new _resolver.default();
    const dbResolver = ((_ctx1 = ctx) === null || _ctx1 === void 0 ? void 0 : _ctx1.dbResolver) || new _dbresolver.default();
    //#region Log
    logger.debug((0, _util.inspect)(signature));
    logger.debug((0, _util.inspect)(activity));
    //#endregion
    /** peer host (リレーから来たらリレー) */ const host = (0, _.toUnicode)(new _url.URL(signature.keyId).hostname.toLowerCase());
    // ブロックしてたら中断  TODO: routeでもチェックしているので消す
    if (await (0, _instancemoderation.isBlockedHost)(host)) {
        return `skip: Blocked instance: ${host}`;
    }
    //#region resolve http-signature signer
    let user;
    // keyIdを元にDBから取得
    user = await dbResolver.getRemoteUserFromKeyId(signature.keyId);
    // || activity.actorを元にDBから取得 || activity.actorを元にリモートから取得
    if (user == null) {
        try {
            user = await (0, _person.resolvePerson)((0, _type.getApId)(activity.actor), undefined, resolver, (0, _type.isDelete)(activity) || (0, _type.isUndo)(activity));
        } catch (e) {
            // 対象が4xxならスキップ
            if (e instanceof _fetch.StatusError && e.isClientError) {
                return `skip: Ignored actor ${activity.actor} - ${e.statusCode}`;
            }
            throw `Error in actor ${activity.actor} - ${e.statusCode || e}`;
        }
    }
    // http-signature signer がわからなければ終了
    if (user == null) {
        return `skip: failed to resolve http-signature signer`;
    }
    // publicKey がなくても終了
    if (user.publicKey == null) {
        return `skip: failed to resolve user publicKey`;
    }
    //#endregion
    // http-signature signerのpublicKeyを元にhttp-signatureを検証
    const httpSignatureValidated = _httpsignature.verifySignature(signature, user.publicKey.publicKeyPem);
    // 署名検証失敗時にはkeyが変わったことも想定して、WebFingerからのユーザー情報の更新をトリガしておく (24時間以上古い場合に発動)
    if (!httpSignatureValidated) {
        (0, _resolveuser.default)(user.username, user.host);
    }
    // また、http-signatureのsignerは、activity.actorと一致する必要がある
    if (!httpSignatureValidated || user.uri !== activity.actor) {
        // でもLD-Signatureがありそうならそっちも見る
        if (!_config.default.ignoreApForwarded && activity.signature) {
            var _user;
            if (activity.signature.type !== 'RsaSignature2017') {
                return `skip: unsupported LD-signature type ${activity.signature.type}`;
            }
            // activity.signature.creator: https://example.oom/users/user#main-key
            // みたいになっててUserを引っ張れば公開キーも入ることを期待する
            if (activity.signature.creator) {
                const candicate = activity.signature.creator.replace(/#.*/, '');
                await (0, _person.resolvePerson)(candicate).catch(()=>null);
            }
            // keyIdからLD-Signatureのユーザーを取得
            user = await dbResolver.getRemoteUserFromKeyId(activity.signature.creator);
            if (user == null) {
                return `skip: LD-Signatureのユーザーが取得できませんでした`;
            }
            if (user.publicKey == null) {
                return `skip: LD-SignatureのユーザーはpublicKeyを持っていませんでした`;
            }
            // LD-Signature検証
            const ldSignature = new _ldsignature.LdSignature();
            const verified = await ldSignature.verifyRsaSignature2017(activity, (_user = user) === null || _user === void 0 ? void 0 : _user.publicKey.publicKeyPem).catch(()=>false);
            if (!verified) {
                return `skip: LD-Signatureの検証に失敗しました`;
            }
            // もう一度actorチェック
            if (user.uri !== activity.actor) {
                return `skip: LD-Signature user(${user.uri}) !== activity.actor(${activity.actor})`;
            }
            // ブロックしてたら中断
            const ldHost = (0, _converthost.extractApHost)(user.uri);
            if (await (0, _instancemoderation.isBlockedHost)(ldHost)) {
                return `skip: Blocked instance: ${ldHost}`;
            }
        } else {
            return `skip: http-signature verification failed and ${_config.default.ignoreApForwarded ? 'ignoreApForwarded' : 'no LD-Signature'}. keyId=${signature.keyId}`;
        }
    }
    // activity.idがあればホストが署名者のホストであることを確認する
    if (typeof activity.id === 'string') {
        const signerHost = (0, _converthost.extractApHost)(user.uri);
        const activityIdHost = (0, _converthost.extractApHost)(activity.id);
        if (signerHost !== activityIdHost) {
            return `skip: signerHost(${signerHost}) !== activity.id host(${activityIdHost}`;
        }
    }
    // Update stats
    (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(host).then((i)=>{
        const set = {
            latestRequestReceivedAt: new Date(),
            lastCommunicatedAt: new Date(),
            isNotResponding: false,
            isMarkedAsClosed: false
        };
        _instance.default.update({
            _id: i._id
        }, {
            $set: set
        }).then(()=>{
            (0, _serverevent.publishInstanceModUpdated)();
        });
        (0, _updateinstanceinfo.UpdateInstanceinfo)(i, data.request);
        _instance1.default.requestReceived(i.host);
    });
    //#endregion
    // アクティビティを処理
    return await (0, _perform.default)(user, activity) || 'ok';
};

//# sourceMappingURL=inbox.js.map
