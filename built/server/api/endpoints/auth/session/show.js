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
const _authsession = require("../../../../../models/auth-session");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    tags: [
        'auth'
    ],
    requireCredential: false,
    params: {
        token: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'セッションのトークン',
                'en-US': 'The token of a session.'
            }
        }
    },
    errors: {
        noSuchSession: {
            message: 'No such session.',
            code: 'NO_SUCH_SESSION',
            id: 'bd72c97d-eba7-4adb-a467-f171b8847250'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Lookup session
    const session = await _authsession.default.findOne({
        token: ps.token
    });
    if (session == null) {
        throw new _error.ApiError(meta.errors.noSuchSession);
    }
    const packed = await (0, _authsession.pack)(session, user);
    packed.app.name = packed.app.name.replace('<', '＜');
    return packed;
});

//# sourceMappingURL=show.js.map
