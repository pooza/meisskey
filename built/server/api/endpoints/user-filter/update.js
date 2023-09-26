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
const _userfilter = require("../../../../models/user-filter");
const _serverevent = require("../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': 'ユーザーをミュートします。',
        'en-US': 'Mute a user'
    },
    tags: [
        'user-filter',
        'users'
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
        hideRenote: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'hideRenote'
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '16615490-b8a7-4c36-b948-698c47d9f1da'
        },
        targetIsYourself: {
            message: 'Target is yourself.',
            code: 'TARGET_IS_YOURSELF',
            id: '5396c49d-66b0-4f4a-8451-7e56472a5129'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    // reject myself
    if (me._id.equals(ps.targetId)) {
        throw new _error.ApiError(meta.errors.targetIsYourself);
    }
    // get target
    const target = await (0, _getters.getUser)(ps.targetId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    const updates = {};
    if (ps.hideRenote !== undefined) updates.hideRenote = ps.hideRenote;
    const key = {
        ownerId: me._id,
        targetId: target._id
    };
    const exist = await _userfilter.default.findOne(key);
    if (exist) {
        await _userfilter.default.update(key, {
            $set: updates
        });
    } else {
        await _userfilter.default.insert(Object.assign(key, updates));
    }
    (0, _serverevent.publishFilterChanged)(me._id);
    return;
});

//# sourceMappingURL=update.js.map
