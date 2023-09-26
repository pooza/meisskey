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
const _matching = require("../../../../../models/games/reversi/matching");
const _define = require("../../../define");
const meta = {
    tags: [
        'games'
    ],
    requireCredential: true
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Find session
    const invitations = await _matching.default.find({
        childId: user._id
    }, {
        sort: {
            _id: -1
        }
    });
    return await Promise.all(invitations.map((i)=>(0, _matching.pack)(i, user)));
});

//# sourceMappingURL=invitations.js.map
