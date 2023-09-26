"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    setResponseType: function() {
        return setResponseType;
    },
    default: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _router = require("@koa/router");
const _koajsonbody = require("koa-json-body");
const _httpsignature = require("http-signature");
const _renderer = require("../remote/activitypub/renderer");
const _note = require("../models/note");
const _user = require("../models/user");
const _emoji = require("../models/emoji");
const _note1 = require("../remote/activitypub/renderer/note");
const _key = require("../remote/activitypub/renderer/key");
const _person = require("../remote/activitypub/renderer/person");
const _emoji1 = require("../remote/activitypub/renderer/emoji");
const _outbox = require("./activitypub/outbox");
const _followers = require("./activitypub/followers");
const _following = require("./activitypub/following");
const _featured = require("./activitypub/featured");
const _queue = require("../queue");
const _converthost = require("../misc/convert-host");
const _notereaction = require("../models/note-reaction");
const _like = require("../remote/activitypub/renderer/like");
const _util = require("util");
const _config = require("../config");
const _fetchmeta = require("../misc/fetch-meta");
const _instancemoderation = require("../services/instance-moderation");
const _ = require("punycode/");
const _logger = require("../services/logger");
const _limiter = require("./api/limiter");
const _array = require("../prelude/array");
const logger = new _logger.default('activitypub');
// Init router
const router = new _router();
//#region Routing
async function inbox(ctx) {
    if (_config.default.disableFederation) ctx.throw(404);
    let signature;
    try {
        signature = _httpsignature.parseRequest(ctx.req, {
            'headers': []
        });
    } catch (e) {
        logger.warn(`inbox: signature parse error: ${(0, _util.inspect)(e)}`);
        ctx.status = 401;
        return;
    }
    try {
        /** peer host (リレーから来たらリレー) */ const host = (0, _.toUnicode)(new URL(signature.keyId).hostname.toLowerCase());
        // ブロックしてたら中断
        if (await (0, _instancemoderation.isBlockedHost)(host)) {
            logger.info(`inbox: blocked instance ${host}`);
            ctx.status = 403;
            return;
        }
    } catch (e) {
        logger.warn(`inbox: error ${e}`);
        ctx.status = 400;
        return;
    }
    const actor = signature.keyId.replace(/[^0-9A-Za-z]/g, '_');
    const activity = ctx.request.body;
    let lazy = false;
    if (actor && [
        'Delete',
        'Undo'
    ].includes((0, _array.toSingle)(activity.type))) {
        const ep = {
            name: `inboxDeletex60-${actor}`,
            exec: null,
            meta: {
                limit: {
                    duration: 60 * 1000,
                    max: 10
                }
            }
        };
        try {
            await (0, _limiter.default)(ep, undefined, undefined);
        } catch (e) {
            console.log(`InboxLimit: ${actor}`);
            if (_config.default.inboxMassDelOpeMode === 'ignore') {
                ctx.status = 202;
                return;
            }
            lazy = true;
        }
    }
    const queue = await (lazy ? _queue.inboxLazy : _queue.inbox)(activity, signature, {
        ip: ctx.request.ip
    });
    ctx.status = 202;
    ctx.body = {
        queueId: queue.id
    };
}
const ACTIVITY_JSON = 'application/activity+json; charset=utf-8';
const LD_JSON = 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"; charset=utf-8';
function isActivityPubReq(ctx, preferAp = false) {
    ctx.response.vary('Accept');
    const accepted = preferAp ? ctx.accepts(ACTIVITY_JSON, LD_JSON, 'html') : ctx.accepts('html', ACTIVITY_JSON, LD_JSON);
    return typeof accepted === 'string' && !accepted.match(/html/);
}
function setCacheHeader(ctx, note) {
    if (note.expiresAt) {
        const s = (note.expiresAt.getTime() - new Date().getTime()) / 1000;
        if (s < 180) {
            ctx.set('Expires', note.expiresAt.toUTCString());
            return;
        }
    }
    ctx.set('Cache-Control', 'public, max-age=180');
    return;
}
function setResponseType(ctx) {
    const accept = ctx.accepts(ACTIVITY_JSON, LD_JSON);
    if (accept === LD_JSON) {
        ctx.response.type = LD_JSON;
    } else {
        ctx.response.type = ACTIVITY_JSON;
    }
}
// inbox
router.post('/inbox', _koajsonbody({
    limit: '64kb'
}), inbox);
router.post('/users/:user/inbox', _koajsonbody({
    limit: '64kb'
}), inbox);
const isNoteUserAvailable = async (note)=>{
    const user = await _user.default.findOne({
        _id: note.userId,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        }
    });
    return user != null;
};
// note
router.get('/notes/:note', async (ctx, next)=>{
    if (!isActivityPubReq(ctx)) return await next();
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.note)) {
        ctx.status = 404;
        return;
    }
    let note = await _note.default.findOne({
        _id: new _mongodb.ObjectID(ctx.params.note),
        deletedAt: {
            $exists: false
        },
        visibility: {
            $in: [
                'public',
                'home'
            ]
        },
        localOnly: {
            $ne: true
        },
        copyOnce: {
            $ne: true
        }
    });
    if (note == null || !await isNoteUserAvailable(note)) {
        ctx.status = 404;
        return;
    }
    // リモートだったらリダイレクト
    if (note._user.host != null) {
        if (note.uri == null || (0, _converthost.isSelfHost)(note._user.host)) {
            ctx.status = 500;
            return;
        }
        ctx.redirect(note.uri);
        return;
    }
    const meta = await (0, _fetchmeta.default)();
    if (meta.exposeHome) {
        note = Object.assign(note, {
            visibility: 'home'
        });
    }
    ctx.body = (0, _renderer.renderActivity)(await (0, _note1.default)(note, false));
    setCacheHeader(ctx, note);
    setResponseType(ctx);
});
// note activity
router.get('/notes/:note/activity', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.note)) {
        ctx.status = 404;
        return;
    }
    let note = await _note.default.findOne({
        _id: new _mongodb.ObjectID(ctx.params.note),
        deletedAt: {
            $exists: false
        },
        '_user.host': null,
        visibility: {
            $in: [
                'public',
                'home'
            ]
        },
        localOnly: {
            $ne: true
        },
        copyOnce: {
            $ne: true
        }
    });
    if (note == null || !await isNoteUserAvailable(note)) {
        ctx.status = 404;
        return;
    }
    const meta = await (0, _fetchmeta.default)();
    if (meta.exposeHome) {
        note = Object.assign(note, {
            visibility: 'home'
        });
    }
    ctx.body = (0, _renderer.renderActivity)(await (0, _outbox.packActivity)(note));
    setCacheHeader(ctx, note);
    setResponseType(ctx);
});
// outbox
router.get('/users/:user/outbox', _outbox.default);
// followers
router.get('/users/:user/followers', _followers.default);
// following
router.get('/users/:user/following', _following.default);
// featured
router.get('/users/:user/collections/featured', _featured.default);
// publickey
router.get('/users/:user/publickey', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    const user = await _user.default.findOne({
        _id: userId,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        },
        host: null
    });
    if (user === null) {
        ctx.status = 404;
        return;
    }
    if ((0, _user.isLocalUser)(user)) {
        ctx.body = (0, _renderer.renderActivity)((0, _key.default)(user));
        ctx.set('Cache-Control', 'public, max-age=180');
        setResponseType(ctx);
    } else {
        ctx.status = 400;
    }
});
// user
async function userInfo(ctx, user) {
    if (user == null) {
        ctx.status = 404;
        return;
    }
    ctx.body = (0, _renderer.renderActivity)(await (0, _person.default)(user));
    ctx.set('Cache-Control', 'public, max-age=180');
    setResponseType(ctx);
}
router.get('/users/:user', async (ctx, next)=>{
    if (!isActivityPubReq(ctx, true)) return await next();
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    const user = await _user.default.findOne({
        _id: userId,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        },
        host: null
    });
    await userInfo(ctx, user);
});
router.get('/@:user', async (ctx, next)=>{
    if (!isActivityPubReq(ctx)) return await next();
    if (_config.default.disableFederation) ctx.throw(404);
    const user = await _user.default.findOne({
        usernameLower: ctx.params.user.toLowerCase(),
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        },
        host: null
    });
    await userInfo(ctx, user);
});
//#endregion
// emoji
router.get('/emojis/:emoji', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    const emoji = await _emoji.default.findOne({
        host: null,
        name: ctx.params.emoji
    });
    if (emoji == null) {
        ctx.status = 404;
        return;
    }
    ctx.body = (0, _renderer.renderActivity)(await (0, _emoji1.default)(emoji));
    ctx.set('Cache-Control', 'public, max-age=180');
    setResponseType(ctx);
});
// like
router.get('/likes/:like', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.like)) {
        ctx.status = 404;
        return;
    }
    const reaction = await _notereaction.default.findOne({
        _id: new _mongodb.ObjectID(ctx.params.like)
    });
    if (reaction == null) {
        ctx.status = 404;
        return;
    }
    const note = await _note.default.findOne({
        _id: reaction.noteId
    });
    if (note == null) {
        ctx.status = 404;
        return;
    }
    ctx.body = (0, _renderer.renderActivity)(await (0, _like.renderLike)(reaction, note));
    ctx.set('Cache-Control', 'public, max-age=180');
    setResponseType(ctx);
});
const _default = router;

//# sourceMappingURL=activitypub.js.map
