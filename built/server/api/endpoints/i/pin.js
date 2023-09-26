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
const _user = require("../../../../models/user");
const _pin = require("../../../../services/i/pin");
const _define = require("../../define");
const _error = require("../../error");
const _stream = require("../../../../services/stream");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定した投稿をピン留めします。'
    },
    tags: [
        'account',
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'Target note ID'
            }
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: '56734f8b-3928-431e-bf80-6ff87df40cb3'
        },
        pinLimitExceeded: {
            message: 'You can not pin notes any more.',
            code: 'PIN_LIMIT_EXCEEDED',
            id: '72dab508-c64d-498f-8740-a8eec1ba385a'
        },
        alreadyPinned: {
            message: 'That note has already been pinned.',
            code: 'ALREADY_PINNED',
            id: '8b18c2b7-68fe-4edb-9892-c0cbaeb6c913'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await (0, _pin.addPinned)(user, ps.noteId).catch((e)=>{
        if (e.id === '70c4e51f-5bea-449c-a030-53bee3cce202') throw new _error.ApiError(meta.errors.noSuchNote);
        if (e.id === '15a018eb-58e5-4da1-93be-330fcc5e4e1a') throw new _error.ApiError(meta.errors.pinLimitExceeded);
        if (e.id === '23f0cf4e-59a3-4276-a91d-61a5891c1514') throw new _error.ApiError(meta.errors.alreadyPinned);
        throw e;
    });
    const updated = await _user.default.findOne({
        _id: user._id
    });
    const packed = await (0, _user.pack)(updated, user, {
        detail: true
    });
    (0, _stream.publishMainStream)(user._id, 'meUpdated', packed);
    return packed;
});

//# sourceMappingURL=pin.js.map
