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
            validator: _cafy.default.str.min(1)
        },
        jobId: {
            validator: _cafy.default.str.min(1)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const queue = ps.domain === 'deliver' ? _queues.deliverQueue : ps.domain === 'inbox' ? _queues.inboxQueue : ps.domain === 'db' ? _queues.dbQueue : null;
    if (queue == null) throw `invalid domain`;
    const job = await queue.getJob(ps.jobId);
    const logs = await queue.getJobLogs(ps.jobId);
    return {
        job,
        logs: logs.logs
    };
});

//# sourceMappingURL=job.js.map
