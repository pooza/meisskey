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
const _relay = require("../../../../../services/relay");
const meta = {
    desc: {
        'ja-JP': 'Remove relay'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        inbox: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    return await (0, _relay.removeRelay)(ps.inbox);
});

//# sourceMappingURL=remove.js.map
