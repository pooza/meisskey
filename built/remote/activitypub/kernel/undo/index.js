"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _type = require("../../type");
const _follow = require("./follow");
const _block = require("./block");
const _like = require("./like");
const _resolver = require("../../resolver");
const _logger = require("../../logger");
const _announce = require("./announce");
const logger = _logger.apLogger;
const _default = async (actor, activity)=>{
    if ('actor' in activity && actor.uri !== activity.actor) {
        return `skip: invalid actor`;
    }
    const uri = activity.id || activity;
    logger.info(`Undo: ${uri}`);
    const resolver = new _resolver.default();
    let object;
    try {
        object = await resolver.resolve(activity.object);
    } catch (e) {
        return `skip: Resolution failed: ${e}`;
    }
    if ((0, _type.isFollow)(object)) return await (0, _follow.default)(actor, object);
    if ((0, _type.isBlock)(object)) return await (0, _block.default)(actor, object);
    if ((0, _type.isLike)(object)) return await (0, _like.default)(actor, object);
    if ((0, _type.isAnnounce)(object)) return await (0, _announce.undoAnnounce)(actor, object);
    return `skip: unknown object type ${(0, _type.getApType)(object)}`;
};

//# sourceMappingURL=index.js.map
