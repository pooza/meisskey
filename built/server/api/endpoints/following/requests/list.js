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
const _followrequest = require("../../../../../models/follow-request");
const _define = require("../../../define");
const meta = {
    desc: {
        'ja-JP': '自分に届いたフォローリクエストの一覧を取得します。',
        'en-US': 'Get all pending received follow requests.'
    },
    tags: [
        'following',
        'account'
    ],
    requireCredential: true,
    kind: [
        'read:following',
        'following-read'
    ]
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const reqs = await _followrequest.default.find({
        followeeId: user._id
    });
    return await Promise.all(reqs.map((req)=>(0, _followrequest.pack)(req)));
});

//# sourceMappingURL=list.js.map
