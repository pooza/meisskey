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
const meta = {
    desc: {
        'ja-JP': '招待コードの一覧を返します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        }
    },
    errors: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const tickets = await _registrationtickets.default.find({}, {
        sort: {
            _id: -1
        },
        skip: ps.offset,
        limit: ps.limit
    });
    return await Promise.all(tickets.map((x)=>(0, _registrationtickets.packRegistrationTicket)(x)));
});

//# sourceMappingURL=list.js.map
