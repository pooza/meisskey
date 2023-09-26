"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _define = require("../../../define");
const _instance = require("../../../../../models/instance");
const _serverevent = require("../../../../../services/server-event");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        host: {
            validator: _cafy.default.str
        },
        isBlocked: {
            validator: _cafy.default.bool
        },
        isClosed: {
            validator: _cafy.default.bool
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const instance = await _instance.default.findOne({
        host: ps.host
    });
    if (instance == null) {
        throw new Error('instance not found');
    }
    await _instance.default.update({
        host: ps.host
    }, {
        $set: {
            isBlocked: ps.isBlocked,
            isMarkedAsClosed: ps.isClosed
        }
    });
    (0, _serverevent.publishInstanceModUpdated)();
    return;
});

//# sourceMappingURL=update-instance.js.map
