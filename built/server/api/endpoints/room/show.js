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
const _define = require("../../define");
const _cafyid = require("../../../../misc/cafy-id");
const _room = require("../../../../models/room");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    desc: {
        'ja-JP': '指定した部屋の情報を取得します。'
    },
    tags: [
        'room'
    ],
    requireCredential: false,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        floor: {
            validator: _cafy.default.optional.num.int().min(-999).max(999),
            default: 0,
            desc: {
                'ja-JP': '階数',
                'en-US': 'Number of floors'
            }
        }
    },
    errors: {
        noSuchRoom: {
            message: 'No such room.',
            code: 'NO_SUCH_ROOM',
            id: '68bb0229-65b0-4d95-9e99-48ce49fd632d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const room = await _room.default.findOne({
        userId: ps.userId,
        floor: ps.floor
    });
    if (room) {
        const u = await (0, _getters.getUser)(room.userId);
        if (u.isDeleted || u.isSuspended) throw new _error.ApiError(meta.errors.noSuchRoom);
    }
    return await (0, _room.packRoom)(room);
});

//# sourceMappingURL=show.js.map
