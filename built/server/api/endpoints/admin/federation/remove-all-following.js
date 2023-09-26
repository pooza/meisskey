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
const _following = require("../../../../../models/following");
const _user = require("../../../../../models/user");
const _delete = require("../../../../../services/following/delete");
const meta = {
    tags: [
        'admin'
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
    const followings = await _following.default.find({
        '_follower.host': ps.host
    });
    const pairs = await Promise.all(followings.map((f)=>Promise.all([
            _user.default.findOne({
                _id: f.followerId
            }),
            _user.default.findOne({
                _id: f.followeeId
            })
        ])));
    for (const pair of pairs){
        (0, _delete.default)(pair[0], pair[1]);
    }
    return;
});

//# sourceMappingURL=remove-all-following.js.map
