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
const _matching = require("../../../../../../models/games/reversi/matching");
const _define = require("../../../../define");
const meta = {
    tags: [
        'games'
    ],
    requireCredential: true
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await _matching.default.remove({
        parentId: user._id
    });
    return;
});

//# sourceMappingURL=cancel.js.map
