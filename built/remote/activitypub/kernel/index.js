"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    performActivity: function() {
        return performActivity;
    },
    performOneActivity: function() {
        return performOneActivity;
    }
});
const _type = require("../type");
const _create = require("./create");
const _delete = require("./delete");
const _update = require("./update");
const _read = require("./read");
const _follow = require("./follow");
const _undo = require("./undo");
const _like = require("./like");
const _announce = require("./announce");
const _accept = require("./accept");
const _reject = require("./reject");
const _add = require("./add");
const _remove = require("./remove");
const _block = require("./block");
const _flag = require("./flag");
const _logger = require("../logger");
const _resolver = require("../resolver");
const _array = require("../../../prelude/array");
const _activeusers = require("../../../services/chart/active-users");
async function performActivity(actor, activity) {
    _activeusers.default.update(actor);
    if ((0, _type.isCollectionOrOrderedCollection)(activity)) {
        const resolver = new _resolver.default();
        for (const item of (0, _array.toArray)((0, _type.isCollection)(activity) ? activity.items : activity.orderedItems)){
            try {
                const act = await resolver.resolve(item);
                const result = await performOneActivity(actor, act);
                _logger.apLogger.info(`processed: ${result}`);
            } catch (e) {
                _logger.apLogger.warn(`failed: ${e}`);
                continue;
            }
        }
        return `ok: collection activity completed`;
    } else {
        return await performOneActivity(actor, activity);
    }
}
async function performOneActivity(actor, activity) {
    if (actor.isSuspended || actor.isDeleted) return 'skip: actor is suspended or deleted';
    if ((0, _type.isCreate)(activity)) {
        return await (0, _create.default)(actor, activity);
    } else if ((0, _type.isDelete)(activity)) {
        return await (0, _delete.default)(actor, activity);
    } else if ((0, _type.isUpdate)(activity)) {
        return await (0, _update.default)(actor, activity);
    } else if ((0, _type.isRead)(activity)) {
        return await (0, _read.performReadActivity)(actor, activity);
    } else if ((0, _type.isFollow)(activity)) {
        return await (0, _follow.default)(actor, activity);
    } else if ((0, _type.isAccept)(activity)) {
        return await (0, _accept.default)(actor, activity);
    } else if ((0, _type.isReject)(activity)) {
        return await (0, _reject.default)(actor, activity);
    } else if ((0, _type.isAdd)(activity)) {
        return await (0, _add.default)(actor, activity);
    } else if ((0, _type.isRemove)(activity)) {
        return await (0, _remove.default)(actor, activity);
    } else if ((0, _type.isAnnounce)(activity)) {
        return await (0, _announce.default)(actor, activity);
    } else if ((0, _type.isLike)(activity)) {
        return await (0, _like.default)(actor, activity);
    } else if ((0, _type.isUndo)(activity)) {
        return await (0, _undo.default)(actor, activity);
    } else if ((0, _type.isBlock)(activity)) {
        return await (0, _block.default)(actor, activity);
    } else if ((0, _type.isFlag)(activity)) {
        return await (0, _flag.default)(actor, activity);
    } else {
        return `skip: unknown activity type: ${activity.type}`;
    }
}

//# sourceMappingURL=index.js.map
