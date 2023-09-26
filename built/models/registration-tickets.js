"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packRegistrationTicket: function() {
        return packRegistrationTicket;
    }
});
const _mongodb = require("../db/mongodb");
const _user = require("./user");
const RegistrationTicket = _mongodb.default.get('registrationTickets');
RegistrationTicket.createIndex('code', {
    unique: true
});
const _default = RegistrationTicket;
async function packRegistrationTicket(src) {
    var _src_expiresAt;
    return {
        id: src._id,
        code: src.code,
        createdAt: src.createdAt.toISOString(),
        expiredAt: (_src_expiresAt = src.expiresAt) === null || _src_expiresAt === void 0 ? void 0 : _src_expiresAt.toISOString(),
        inviterId: src.inviterId,
        inviteeIds: src.inviterId,
        inviter: src.inviterId && await (0, _user.pack)(src.inviterId),
        invitees: src.inviteeIds && await Promise.all(src.inviteeIds.map((x)=>(0, _user.pack)(x))),
        restCount: src.restCount
    };
}

//# sourceMappingURL=registration-tickets.js.map
