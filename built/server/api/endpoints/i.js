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
const _user = require("../../../models/user");
const _define = require("../define");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '自分のアカウント情報を取得します。'
    },
    tags: [
        'account'
    ],
    requireCredential: true,
    params: {},
    res: {
        type: 'User'
    }
};
const _default = (0, _define.default)(meta, async (ps, user, app)=>{
    const isSecure = user != null && app == null;
    return await (0, _user.pack)(user, user, {
        detail: true,
        includeHasUnreadNotes: true,
        includeSecrets: isSecure
    });
});

//# sourceMappingURL=i.js.map
