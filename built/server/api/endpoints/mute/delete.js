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
const meta = {
    desc: {
        'ja-JP': 'ユーザーのミュートを解除します。',
        'en-US': 'Unmute a user'
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
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: 'b851d00b-8ab1-4a56-8b1b-e24187cb48ef'
        },
        muteeIsYourself: {
            message: 'Mutee is yourself.',
            code: 'MUTEE_IS_YOURSELF',
            id: 'f428b029-6b39-4d48-a1d2-cc1ae6dd5cf9'
        },
        notMuting: {
            message: 'You are not muting that user.',
            code: 'NOT_MUTING',
            id: '5467d020-daa9-4553-81e1-135c0c35a96d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const muter = user;
    // Check if the mutee is yourself
    if (user._id.equals(ps.userId)) {
        throw new _error.ApiError(meta.errors.muteeIsYourself);
    }
    // Get mutee
    const mutee = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    // Check not muting (期限切れのがあるかもしれないので期限問わず消す)
    const exist = await _mute.default.findOne({
        muterId: (0, _cafyid.transform)(muter._id),
        muteeId: (0, _cafyid.transform)(mutee._id)
    });
    if (exist == null) {
        throw new _error.ApiError(meta.errors.notMuting);
    }
    // Delete mute
    await _mute.default.remove({
        _id: exist._id
    });
    (0, _serverevent.publishMutingChanged)(muter._id);
    return;
});

//# sourceMappingURL=delete.js.map
