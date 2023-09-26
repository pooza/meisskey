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
const _mute = require("../../../../models/mute");
const _define = require("../../define");
const _error = require("../../error");
const _getters = require("../../common/getters");
const _serverevent = require("../../../../services/server-event");
const _queue = require("../../../../queue");
const meta = {
    desc: {
        'ja-JP': 'ユーザーをミュートします。',
        'en-US': 'Mute a user'
    },
    tags: [
        'account'
    ],
    requireCredential: true,
    kind: [
        'write:mutes',
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        expiresAt: {
            validator: _cafy.default.optional.nullable.num.int(),
            desc: {
                'ja-JP': 'ミュートの期限',
                'en-US': 'Expires at'
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '6fef56f3-e765-4957-88e5-c6f65329b8a5'
        },
        muteeIsYourself: {
            message: 'Mutee is yourself.',
            code: 'MUTEE_IS_YOURSELF',
            id: 'a4619cb2-5f23-484b-9301-94c903074e10'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const muter = user;
    // 自分自身
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.muteeIsYourself);
    }
    // Get mutee
    const mutee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Check if already muting
    const exist = await _mute.default.findOne({
        muterId: (0, _cafyid.transform)(muter._id),
        muteeId: (0, _cafyid.transform)(mutee._id)
    });
    // 既存でも既存の期限切れでも常に再採番
    if (exist != null) {
        await _mute.default.remove({
            _id: exist._id
        });
    }
    // Create mute
    const mute = await _mute.default.insert({
        createdAt: new Date(),
        muterId: muter._id,
        muteeId: mutee._id,
        expiresAt: ps.expiresAt ? new Date(ps.expiresAt) : undefined
    });
    (0, _serverevent.publishMutingChanged)(muter._id);
    if (ps.expiresAt) (0, _queue.createExpireMuteJob)(mute);
    return;
});

//# sourceMappingURL=create.js.map
