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
const _define = require("../../../define");
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const _error = require("../../../error");
const _registrationtickets = require("../../../../../models/registration-tickets");
const meta = {
    desc: {
        'ja-JP': '招待コードを削除します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        id: {
            validator: _cafy.default.type(_cafyid.default)
        }
    },
    errors: {
        noSuchInvitation: {
            message: 'No such Invitation.',
            code: 'NO_SUCH_INVITATION',
            id: 'e90d5d7b-a4b6-4aaf-aba8-4f8db8b43a70'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const result = await _registrationtickets.default.remove({
        _id: ps.id
    });
    if (result.deletedCount === 0) {
        throw new _error.ApiError(meta.errors.noSuchInvitation);
    }
    return;
});

//# sourceMappingURL=delete.js.map
