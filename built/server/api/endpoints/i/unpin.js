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
        'ja-JP': '指定した投稿のピン留めを解除します。'
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
            id: '454170ce-9d63-4a43-9da1-ea10afe81e21'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await (0, _pin.removePinned)(user, ps.noteId).catch((e)=>{
        if (e.id === 'b302d4cf-c050-400a-bbb3-be208681f40c') throw new _error.ApiError(meta.errors.noSuchNote);
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

//# sourceMappingURL=unpin.js.map
