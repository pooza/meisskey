"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _router = require("@koa/router");
const _oauth = require("oauth");
const _user = require("../../../models/user");
const _config = require("../../../config");
const _stream = require("../../../services/stream");
const _redis = require("../../../db/redis");
const _uuid = require("uuid");
const _signin = require("../common/signin");
const _fetchmeta = require("../../../misc/fetch-meta");
const _fetch = require("../../../misc/fetch");
function getUserToken(ctx) {
    return ((ctx.headers['cookie'] || '').match(/i=(!\w+)/) || [
        null,
        null
    ])[1];
}
function compareOrigin(ctx) {
    function normalizeUrl(url) {
        return url ? url.endsWith('/') ? url.substr(0, url.length - 1) : url : '';
    }
    const referer = ctx.headers['referer'];
    return normalizeUrl(referer) == normalizeUrl(_config.default.url);
}
// Init router
const router = new _router();
router.get('/disconnect/github', async (ctx)=>{
    if (!compareOrigin(ctx)) {
        ctx.throw(400, 'invalid origin');
        return;
    }
    const userToken = getUserToken(ctx);
    if (!userToken) {
        ctx.throw(400, 'signin required');
        return;
    }
    const user = await _user.default.findOneAndUpdate({
        host: null,
        'token': userToken
    }, {
        $set: {
            'github': null
        }
    });
    ctx.body = `GitHubの連携を解除しました :v:`;
    // Publish i updated event
    (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
        detail: true,
        includeSecrets: true
    }));
});
async function getOath2() {
    const meta = await (0, _fetchmeta.default)();
    if (meta.enableGithubIntegration) {
        return new _oauth.OAuth2(meta.githubClientId, meta.githubClientSecret, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token');
    } else {
        return null;
    }
}
router.get('/connect/github', async (ctx)=>{
    if (!compareOrigin(ctx)) {
        ctx.throw(400, 'invalid origin');
        return;
    }
    const userToken = getUserToken(ctx);
    if (!userToken) {
        ctx.throw(400, 'signin required');
        return;
    }
    const params = {
        redirect_uri: `${_config.default.url}/api/gh/cb`,
        scope: [
            'read:user'
        ],
        state: (0, _uuid.v4)()
    };
    _redis.default.set(userToken, JSON.stringify(params));
    const oauth2 = await getOath2();
    ctx.redirect(oauth2.getAuthorizeUrl(params));
});
router.get('/signin/github', async (ctx)=>{
    const sessid = (0, _uuid.v4)();
    const params = {
        redirect_uri: `${_config.default.url}/api/gh/cb`,
        scope: [
            'read:user'
        ],
        state: (0, _uuid.v4)()
    };
    ctx.cookies.set('signin_with_github_sid', sessid, {
        path: '/',
        secure: _config.default.url.startsWith('https'),
        httpOnly: true
    });
    // Cache-Controlは/api/でprivateになっている
    _redis.default.set(sessid, JSON.stringify(params));
    const oauth2 = await getOath2();
    ctx.redirect(oauth2.getAuthorizeUrl(params));
});
router.get('/gh/cb', async (ctx)=>{
    const userToken = getUserToken(ctx);
    const oauth2 = await getOath2();
    if (!userToken) {
        const sessid = ctx.cookies.get('signin_with_github_sid');
        if (!sessid) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const code = ctx.query.code;
        if (!code) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const { redirect_uri, state } = await new Promise((res, rej)=>{
            _redis.default.get(sessid, async (_, state)=>{
                res(JSON.parse(state));
            });
        });
        if (ctx.query.state !== state) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const { accessToken } = await new Promise((res, rej)=>oauth2.getOAuthAccessToken(code, {
                redirect_uri
            }, (err, accessToken, refresh, result)=>{
                if (err) rej(err);
                else if (result.error) rej(result.error);
                else res({
                    accessToken
                });
            }));
        const { login, id } = await (0, _fetch.getJson)('https://api.github.com/user', 'application/vnd.github.v3+json', 10 * 1000, {
            'Authorization': `bearer ${accessToken}`
        });
        if (!login || !id) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const user = await _user.default.findOne({
            host: null,
            'github.id': id
        });
        if (!user) {
            ctx.throw(404, `@${login}と連携しているMisskeyアカウントはありませんでした...`);
            return;
        }
        (0, _signin.default)(ctx, user, true);
    } else {
        const code = ctx.query.code;
        if (!code) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const { redirect_uri, state } = await new Promise((res, rej)=>{
            _redis.default.get(userToken, async (_, state)=>{
                res(JSON.parse(state));
            });
        });
        if (ctx.query.state !== state) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const { accessToken } = await new Promise((res, rej)=>oauth2.getOAuthAccessToken(code, {
                redirect_uri
            }, (err, accessToken, refresh, result)=>{
                if (err) rej(err);
                else if (result.error) rej(result.error);
                else res({
                    accessToken
                });
            }));
        const { login, id } = await (0, _fetch.getJson)('https://api.github.com/user', 'application/vnd.github.v3+json', 10 * 1000, {
            'Authorization': `bearer ${accessToken}`
        });
        if (!login || !id) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const user = await _user.default.findOneAndUpdate({
            host: null,
            token: userToken
        }, {
            $set: {
                github: {
                    accessToken,
                    id,
                    login
                }
            }
        });
        ctx.body = `GitHub: @${login} を、Misskey: @${user.username} に接続しました！`;
        // Publish i updated event
        (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
            detail: true,
            includeSecrets: true
        }));
    }
});
const _default = router;

//# sourceMappingURL=github.js.map
