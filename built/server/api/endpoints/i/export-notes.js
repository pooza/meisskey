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
const ms = require("ms");
const meta = {
    secure: true,
    requireCredential: true,
    limit: {
        duration: ms('1day'),
        max: 2
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    (0, _queue.createExportNotesJob)(user);
    return;
});

//# sourceMappingURL=export-notes.js.map
