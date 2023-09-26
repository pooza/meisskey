"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _follow = require("./follow");
const _type = require("../../type");
const _logger = require("../../logger");
const _escaperegexp = require("escape-regexp");
const _config = require("../../../../config");
const _mongodb = require("mongodb");
const _follow1 = require("../../renderer/follow");
const logger = _logger.apLogger;
const _default = async (actor, activity)=>{
    const uri = activity.id || activity;
    logger.info(`Reject: ${uri}`);
    let object;
    if (typeof activity.object !== 'string') {
        // こっちが投げたFollowオブジェクトをそのまま返してくれる場合は、オブジェクト内のこっちのユーザーを使う
        object = activity.object;
    } else {
        // stringで返されたら困ってしまうが、FollowオブジェクトのIDは https://local/followings-from/:id で送ることにしてでっち上げてしまう
        const match = activity.object.match(new RegExp('^' + _escaperegexp(_config.default.url) + '/' + '(\\w+)' + '/' + '(\\w+)'));
        if (match && match[1] === 'followings_from') {
            const u = await _user.default.findOne({
                _id: new _mongodb.ObjectID(match[2]),
                deletedAt: {
                    $exists: false
                },
                host: null
            });
            if (u) {
                object = (0, _follow1.default)(u, actor);
            } else {
                return `skip: Local actor not found. (${activity.object})}`;
            }
        } else {
            return `skip: Not a local actor (${activity.object})`;
        }
    }
    if ((0, _type.isFollow)(object)) return await (0, _follow.default)(actor, object);
    return `skip: Unknown Reject type: ${(0, _type.getApType)(object)}`;
};

//# sourceMappingURL=index.js.map
