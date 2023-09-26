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
const logger = _logger.apLogger;
const _default = async (actor, activity)=>{
    const uri = (0, _type.getApId)(activity);
    logger.info(`Announce: ${uri}`);
    const resolver = new _resolver.default();
    const targetUri = (0, _type.getApId)(activity.object);
    return await (0, _note.default)(resolver, actor, activity, targetUri);
};

//# sourceMappingURL=index.js.map
