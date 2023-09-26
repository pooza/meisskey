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
const _cafyid = require("../../../../misc/cafy-id");
const _define = require("../../define");
const _user = require("../../../../models/user");
const _bcryptjs = require("bcryptjs");
const _rndstr = require("rndstr");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーのパスワードをリセットします。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーID',
                'en-US': 'The user ID which you want to suspend'
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
    if (user.isAdmin) {
        throw new Error('cannot reset password of admin');
    }
    const passwd = (0, _rndstr.default)('a-zA-Z0-9', 8);
    // Generate hash of password
    const hash = _bcryptjs.hashSync(passwd);
    await _user.default.findOneAndUpdate({
        _id: user._id
    }, {
        $set: {
            password: hash
        }
    });
    return {
        password: passwd
    };
});

//# sourceMappingURL=reset-password.js.map
