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
const _define = require("../../../define");
const _registrationtickets = require("../../../../../models/registration-tickets");
const _rndstr = require("rndstr");
const meta = {
    desc: {
        'ja-JP': '招待コードを発行します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        expiredAfter: {
            validator: _cafy.default.optional.nullable.num.int().min(1),
            desc: {
                'ja-JP': '使用期限 (ミリ秒)'
            }
        },
        restCount: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 1,
            desc: {
                'ja-JP': '使用可能数'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const code = (0, _rndstr.default)({
        length: 6,
        chars: '0-9'
    });
    const inserted = await _registrationtickets.default.insert({
        createdAt: new Date(),
        expiresAt: ps.expiredAfter && new Date(new Date().getTime() + ps.expiredAfter),
        restCount: ps.restCount,
        inviterId: user._id,
        code: code
    });
    return await (0, _registrationtickets.packRegistrationTicket)(inserted);
});

//# sourceMappingURL=create.js.map
