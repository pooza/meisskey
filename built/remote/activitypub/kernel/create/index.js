"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _resolver = require("../../resolver");
const _note = require("./note");
const _type = require("../../type");
const _logger = require("../../logger");
const _array = require("../../../../prelude/array");
const logger = _logger.apLogger;
const _default = async (actor, activity)=>{
    const uri = (0, _type.getApId)(activity);
    logger.info(`Create: ${uri}`);
    // copy audiences between activity <=> object.
    if (typeof activity.object === 'object') {
        const to = (0, _array.unique)((0, _array.concat)([
            (0, _array.toArray)(activity.to),
            (0, _array.toArray)(activity.object.to)
        ]));
        const cc = (0, _array.unique)((0, _array.concat)([
            (0, _array.toArray)(activity.cc),
            (0, _array.toArray)(activity.object.cc)
        ]));
        activity.to = to;
        activity.cc = cc;
        activity.object.to = to;
        activity.object.cc = cc;
    }
    // If there is no attributedTo, use Activity actor.
    if (typeof activity.object === 'object' && !activity.object.attributedTo) {
        activity.object.attributedTo = activity.actor;
    }
    const resolver = new _resolver.default();
    let object;
    try {
        object = await resolver.resolve(activity.object);
    } catch (e) {
        logger.error(`Resolution failed: ${e}`);
        throw e;
    }
    if ((0, _type.isPost)(object)) {
        return await (0, _note.default)(resolver, actor, object, false, activity);
    } else {
        return `Unknown type: ${(0, _type.getApType)(object)}`;
    }
};

//# sourceMappingURL=index.js.map
