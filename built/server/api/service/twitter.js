"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _router = require("@koa/router");
const _uuid = require("uuid");
const _autwh = require("autwh");
const _redis = require("../../../db/redis");
const _user = require("../../../models/user");
const _stream = require("../../../services/stream");
const _config = require("../../../config");
const _signin = require("../common/signin");
const _fetchmeta = require("../../../misc/fetch-meta");
function getUserToken(ctx) {
    return ((ctx.headers['cookie'] || '').match(/i=(!\w+)/) || [
        null,
        null
    ])[1];
}
function compareOrigin(ctx) {
    function normalizeUrl(url) {
        return url.endsWith('/') ? url.substr(0, url.length - 1) : url;
    }
    const referer = ctx.headers['referer'];
    return normalizeUrl(referer) == normalizeUrl(_config.default.url);
}
// Init router
const router = new _router();
router.get('/disconnect/twitter', async (ctx)=>{
    if (!compareOrigin(ctx)) {
        ctx.throw(400, 'invalid origin');
        return;
    }
    const userToken = getUserToken(ctx);
    if (userToken == null) {
        ctx.throw(400, 'signin required');
        return;
    }
    const user = await _user.default.findOneAndUpdate({
        host: null,
        'token': userToken
    }, {
        $set: {
            'twitter': null
        }
    });
    ctx.body = `Twitterの連携を解除しました :v:`;
    // Publish i updated event
    (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
        detail: true,
        includeSecrets: true
    }));
});
async function getTwAuth() {
    const meta = await (0, _fetchmeta.default)();
    if (meta.enableTwitterIntegration) {
        return (0, _autwh.default)({
            consumerKey: meta.twitterConsumerKey,
            consumerSecret: meta.twitterConsumerSecret,
            callbackUrl: `${_config.default.url}/api/tw/cb`
        });
    } else {
        return null;
    }
}
router.get('/connect/twitter', async (ctx)=>{
    if (!compareOrigin(ctx)) {
        ctx.throw(400, 'invalid origin');
        return;
    }
    const userToken = getUserToken(ctx);
    if (userToken == null) {
        ctx.throw(400, 'signin required');
        return;
    }
    const twAuth = await getTwAuth();
    const twCtx = await twAuth.begin();
    _redis.default.set(userToken, JSON.stringify(twCtx));
    ctx.redirect(twCtx.url);
});
router.get('/signin/twitter', async (ctx)=>{
    const twAuth = await getTwAuth();
    const twCtx = await twAuth.begin();
    const sessid = (0, _uuid.v4)();
    _redis.default.set(sessid, JSON.stringify(twCtx));
    ctx.cookies.set('signin_with_twitter_sid', sessid, {
        path: '/',
        secure: _config.default.url.startsWith('https'),
        httpOnly: true
    });
    ctx.redirect(twCtx.url);
});
router.get('/tw/cb', async (ctx)=>{
    const userToken = getUserToken(ctx);
    const twAuth = await getTwAuth();
    if (userToken == null) {
        const sessid = ctx.cookies.get('signin_with_twitter_sid');
        if (sessid == null) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const get = new Promise((res, rej)=>{
            _redis.default.get(sessid, async (_, twCtx)=>{
                res(twCtx);
            });
        });
        const twCtx = await get;
        const result = await twAuth.done(JSON.parse(twCtx), ctx.query.oauth_verifier);
        const user = await _user.default.findOne({
            host: null,
            'twitter.userId': result.userId
        });
        if (user == null) {
            ctx.throw(404, `@${result.screenName}と連携しているMisskeyアカウントはありませんでした...`);
            return;
        }
        (0, _signin.default)(ctx, user, true);
    } else {
        const verifier = ctx.query.oauth_verifier;
        if (verifier == null) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const get = new Promise((res, rej)=>{
            _redis.default.get(userToken, async (_, twCtx)=>{
                res(twCtx);
            });
        });
        const twCtx = await get;
        const result = await twAuth.done(JSON.parse(twCtx), verifier);
        const user = await _user.default.findOneAndUpdate({
            host: null,
            token: userToken
        }, {
            $set: {
                twitter: {
                    accessToken: result.accessToken,
                    accessTokenSecret: result.accessTokenSecret,
                    userId: result.userId,
                    screenName: result.screenName
                }
            }
        });
        ctx.body = `Twitter: @${result.screenName} を、Misskey: @${user.username} に接続しました！`;
        // Publish i updated event
        (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
            detail: true,
            includeSecrets: true
        }));
    }
});
const _default = router;

//# sourceMappingURL=twitter.js.map
