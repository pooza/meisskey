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
const _queue = require("../../../../../queue");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        domain: {
            validator: _cafy.default.optional.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    (0, _queue.destroy)(ps.domain);
    return;
});

//# sourceMappingURL=clear.js.map
