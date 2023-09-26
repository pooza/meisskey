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
router.get('/disconnect/discord', async (ctx)=>{
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
            'discord': null
        }
    });
    ctx.body = `Discordの連携を解除しました :v:`;
    // Publish i updated event
    (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
        detail: true,
        includeSecrets: true
    }));
});
async function getOAuth2() {
    const meta = await (0, _fetchmeta.default)();
    if (meta.enableDiscordIntegration) {
        return new _oauth.OAuth2(meta.discordClientId, meta.discordClientSecret, 'https://discord.com/', 'api/oauth2/authorize', 'api/oauth2/token');
    } else {
        return null;
    }
}
router.get('/connect/discord', async (ctx)=>{
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
        redirect_uri: `${_config.default.url}/api/dc/cb`,
        scope: [
            'identify'
        ],
        state: (0, _uuid.v4)(),
        response_type: 'code'
    };
    _redis.default.set(userToken, JSON.stringify(params));
    const oauth2 = await getOAuth2();
    ctx.redirect(oauth2.getAuthorizeUrl(params));
});
router.get('/signin/discord', async (ctx)=>{
    const sessid = (0, _uuid.v4)();
    const params = {
        redirect_uri: `${_config.default.url}/api/dc/cb`,
        scope: [
            'identify'
        ],
        state: (0, _uuid.v4)(),
        response_type: 'code'
    };
    ctx.cookies.set('signin_with_discord_sid', sessid, {
        path: '/',
        secure: _config.default.url.startsWith('https'),
        httpOnly: true
    });
    _redis.default.set(sessid, JSON.stringify(params));
    const oauth2 = await getOAuth2();
    ctx.redirect(oauth2.getAuthorizeUrl(params));
});
router.get('/dc/cb', async (ctx)=>{
    const userToken = getUserToken(ctx);
    const oauth2 = await getOAuth2();
    if (!userToken) {
        const sessid = ctx.cookies.get('signin_with_discord_sid');
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
        const { accessToken, refreshToken, expiresDate } = await new Promise((res, rej)=>oauth2.getOAuthAccessToken(code, {
                grant_type: 'authorization_code',
                redirect_uri
            }, (err, accessToken, refreshToken, result)=>{
                if (err) rej(err);
                else if (result.error) rej(result.error);
                else res({
                    accessToken,
                    refreshToken,
                    expiresDate: Date.now() + Number(result.expires_in) * 1000
                });
            }));
        const { id, global_name, username, discriminator } = await (0, _fetch.getJson)('https://discord.com/api/users/@me', '*/*', 10 * 1000, {
            'Authorization': `Bearer ${accessToken}`
        });
        if (!id || !username || !discriminator) {
            ctx.throw(400, 'invalid session');
            return;
        }
        let user = await _user.default.findOne({
            host: null,
            'discord.id': id
        });
        if (!user) {
            ctx.throw(404, `@${username}#${discriminator}と連携しているMisskeyアカウントはありませんでした...`);
            return;
        }
        user = await _user.default.findOneAndUpdate({
            host: null,
            'discord.id': id
        }, {
            $set: {
                discord: {
                    id,
                    accessToken,
                    refreshToken,
                    expiresDate,
                    global_name,
                    username,
                    discriminator
                }
            }
        });
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
        const { accessToken, refreshToken, expiresDate } = await new Promise((res, rej)=>oauth2.getOAuthAccessToken(code, {
                grant_type: 'authorization_code',
                redirect_uri
            }, (err, accessToken, refreshToken, result)=>{
                if (err) rej(err);
                else if (result.error) rej(result.error);
                else res({
                    accessToken,
                    refreshToken,
                    expiresDate: Date.now() + Number(result.expires_in) * 1000
                });
            }));
        const { id, global_name, username, discriminator } = await (0, _fetch.getJson)('https://discord.com/api/users/@me', '*/*', 10 * 1000, {
            'Authorization': `Bearer ${accessToken}`
        });
        if (!id || !username || !discriminator) {
            ctx.throw(400, 'invalid session');
            return;
        }
        const user = await _user.default.findOneAndUpdate({
            host: null,
            token: userToken
        }, {
            $set: {
                discord: {
                    accessToken,
                    refreshToken,
                    expiresDate,
                    id,
                    global_name,
                    username,
                    discriminator
                }
            }
        });
        ctx.body = `Discord: @${username}#${discriminator} を、Misskey: @${user.username} に接続しました！`;
        // Publish i updated event
        (0, _stream.publishMainStream)(user._id, 'meUpdated', await (0, _user.pack)(user, user, {
            detail: true,
            includeSecrets: true
        }));
    }
});
const _default = router;

//# sourceMappingURL=discord.js.map
