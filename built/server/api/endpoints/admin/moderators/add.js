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
const _cafyid = require("../../../../../misc/cafy-id");
const _define = require("../../../define");
const _user = require("../../../../../models/user");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーをモデレーターにします。',
        'en-US': 'Mark a user as moderator.'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireAdmin: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーID',
                'en-US': 'The user ID'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const user = await _user.default.findOne({
        _id: ps.userId
    });
    if (user == null) {
        throw new Error('user not found');
    }
    await _user.default.update({
        _id: user._id
    }, {
        $set: {
            isModerator: true
        }
    });
    return;
});

//# sourceMappingURL=add.js.map
