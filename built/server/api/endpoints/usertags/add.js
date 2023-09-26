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
const _error = require("../../error");
const _getters = require("../../common/getters");
const _usertag = require("../../../../models/usertag");
const meta = {
    desc: {
        'ja-JP': 'ユーザータグを追加します'
    },
    tags: [
        'usertags'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        targetId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        tag: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': '対象のタグ'
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '7179643b-33eb-4055-9dda-18befac06c14'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const target = await (0, _getters.getUser)(ps.targetId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    const usertag = await _usertag.default.findOne({
        ownerId: user._id,
        targetId: target._id
    });
    if (usertag == null) {
        await _usertag.default.insert({
            ownerId: user._id,
            targetId: target._id,
            tags: [
                ps.tag
            ]
        });
    } else {
        if (usertag.tags.includes(ps.tag)) return;
        await _usertag.default.update({
            _id: usertag._id
        }, {
            $push: {
                tags: ps.tag
            }
        });
    }
});

//# sourceMappingURL=add.js.map
