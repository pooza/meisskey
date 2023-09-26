"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _config = require("../../config");
const _cafy = require("cafy");
const _cafyid = require("../../misc/cafy-id");
const _user = require("../../models/user");
const _following = require("../../models/following");
const _url = require("../../prelude/url");
const _renderer = require("../../remote/activitypub/renderer");
const _orderedcollection = require("../../remote/activitypub/renderer/ordered-collection");
const _orderedcollectionpage = require("../../remote/activitypub/renderer/ordered-collection-page");
const _followuser = require("../../remote/activitypub/renderer/follow-user");
const _activitypub = require("../activitypub");
const _default = async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    // Get 'cursor' parameter
    const [cursor, cursorErr] = _cafy.default.optional.type(_cafyid.default).get(ctx.request.query.cursor);
    // Get 'page' parameter
    const pageErr = !_cafy.default.optional.str.or([
        'true',
        'false'
    ]).ok(ctx.request.query.page);
    const page = ctx.request.query.page === 'true';
    // Validate parameters
    if (cursorErr || pageErr) {
        ctx.status = 400;
        return;
    }
    // Verify user
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
    if (user == null) {
        ctx.status = 404;
        return;
    }
    if (user.hideFollows === 'always' || user.hideFollows === 'follower') {
        ctx.status = 403;
        return;
    }
    const limit = 10;
    const partOf = `${_config.default.url}/users/${userId}/following`;
    if (page) {
        const query = {
            followerId: user._id
        };
        // カーソルが指定されている場合
        if (cursor) {
            query._id = {
                $lt: (0, _cafyid.transform)(cursor)
            };
        }
        // Get followings
        const followings = user.hideFollows ? [] : await _following.default.find(query, {
            limit: limit + 1,
            sort: {
                _id: -1
            }
        });
        // 「次のページ」があるかどうか
        const inStock = followings.length === limit + 1;
        if (inStock) followings.pop();
        const renderedFollowees = await Promise.all(followings.map((following)=>(0, _followuser.default)(following.followeeId)));
        const rendered = (0, _orderedcollectionpage.default)(`${partOf}?${_url.query({
            page: 'true',
            cursor
        })}`, user.followingCount, renderedFollowees, partOf, null, inStock ? `${partOf}?${_url.query({
            page: 'true',
            cursor: followings[followings.length - 1]._id.toHexString()
        })}` : null);
        ctx.body = (0, _renderer.renderActivity)(rendered);
        (0, _activitypub.setResponseType)(ctx);
    } else {
        // index page
        const rendered = (0, _orderedcollection.default)(partOf, user.followingCount, user.hideFollows ? null : `${partOf}?page=true`, null);
        ctx.body = (0, _renderer.renderActivity)(rendered);
        ctx.set('Cache-Control', 'public, max-age=180');
        (0, _activitypub.setResponseType)(ctx);
    }
};

//# sourceMappingURL=following.js.map
