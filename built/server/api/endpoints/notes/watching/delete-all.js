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
const _notewatching = require("../../../../../models/note-watching");
const meta = {
    desc: {
        'ja-JP': '指定した投稿のウォッチを全解除します。',
        'en-US': 'Unwatch all.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    await _notewatching.default.remove({
        userId: me._id
    });
});

//# sourceMappingURL=delete-all.js.map
