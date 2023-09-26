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
const _queues = require("../../../../../queue/queues");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {}
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const deliverJobCounts = await _queues.deliverQueue.getJobCounts();
    const inboxJobCounts = await _queues.inboxQueue.getJobCounts();
    return {
        deliver: deliverJobCounts,
        inbox: inboxJobCounts
    };
});

//# sourceMappingURL=stats.js.map
