//import $ from 'cafy';
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
const _define = require("../../define");
const _accesstoken = require("../../../../models/access-token");
const _app = require("../../../../models/app");
const meta = {
    requireCredential: true,
    secure: true,
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const tokens = await _accesstoken.default.find({
        userId: user._id
    }, {
        sort: {
            _id: -1
        }
    });
    return await Promise.all(tokens.map(async (token)=>{
        const app = await _app.default.findOne({
            _id: token.appId
        });
        return {
            id: token._id,
            name: app.name,
            description: app.description,
            createdAt: token.createdAt,
            permission: app.permission
        };
    }));
});

//# sourceMappingURL=apps.js.map
