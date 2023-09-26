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
const _sendemail = require("../../../../services/send-email");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        to: {
            validator: _cafy.default.str
        },
        subject: {
            validator: _cafy.default.str
        },
        text: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    await (0, _sendemail.sendEmail)(ps.to, ps.subject, ps.text);
});

//# sourceMappingURL=send-email.js.map
