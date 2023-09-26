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
const meta = {
    tags: [
        'federation'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        host: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const instance = await _instance.default.findOne({
        host: ps.host
    });
    return instance;
});

//# sourceMappingURL=show-instance.js.map
