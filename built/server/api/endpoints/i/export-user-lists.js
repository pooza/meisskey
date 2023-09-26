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
const _queue = require("../../../../queue");
const meta = {
    secure: true,
    requireCredential: true
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    (0, _queue.createExportUserListsJob)(user);
    return;
});

//# sourceMappingURL=export-user-lists.js.map
