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
const _serverevent = require("../../../../services/server-event");
const meta = {
    requireCredential: true,
    secure: true,
    params: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Terminate streaming
    (0, _serverevent.publishTerminate)(user._id);
    return;
});

//# sourceMappingURL=terminate-streaming.js.map
