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
        state: {
            validator: _cafy.default.str.or([
                'waiting',
                'active',
                'completed',
                'failed',
                'delayed'
            ])
        },
        limit: {
            validator: _cafy.default.optional.num,
            default: 50
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const queue = ps.domain === 'deliver' ? _queues.deliverQueue : ps.domain === 'inbox' ? _queues.inboxQueue : ps.domain === 'db' ? _queues.dbQueue : null;
    if (queue == null) throw `invalid domain`;
    const jobs = await queue.getJobs([
        ps.state
    ], 0, ps.limit);
    return jobs.map((job)=>{
        const data = job.data;
        delete data.content;
        delete data.user;
        return {
            id: job.id,
            data,
            attempts: job.attemptsMade,
            maxAttempts: job.opts ? job.opts.attempts : 0,
            timestamp: job.timestamp,
            name: job.name,
            delay: job.opts.delay
        };
    });
});

//# sourceMappingURL=jobs.js.map
