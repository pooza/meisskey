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
const _define = require("../../../define");
const _queues = require("../../../../../queue/queues");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        domain: {
            validator: _cafy.default.str
        },
        limit: {
            validator: _cafy.default.optional.num,
            default: 250
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const queue = ps.domain === 'deliver' ? _queues.deliverQueue : ps.domain === 'inbox' ? _queues.inboxQueue : null;
    if (queue == null) throw `invalid domain`;
    const jobs = await queue.getJobs([
        'delayed'
    ], 0, ps.limit);
    for (const job of jobs){
        job.promote();
    }
    return;
});

//# sourceMappingURL=promote.js.map
