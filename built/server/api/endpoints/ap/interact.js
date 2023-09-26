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
const _webfinger = require("../../../../remote/webfinger");
const meta = {
    tags: [
        'federation'
    ],
    requireCredential: false,
    params: {
        acct: {
            validator: _cafy.default.str
        }
    },
    errors: {},
    res: {
        type: 'object',
        optional: false,
        nullable: false
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    var _subscribe;
    const r = await (0, _webfinger.default)(ps.acct);
    const subscribe = r.links.filter((link)=>link.rel === 'http://ostatus.org/schema/1.0/subscribe')[0];
    if (!((_subscribe = subscribe) === null || _subscribe === void 0 ? void 0 : _subscribe.template)) throw new Error('no subscribe');
    return {
        template: subscribe.template
    };
});

//# sourceMappingURL=interact.js.map
