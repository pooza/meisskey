"use strict";
Object.defineProperty(exports, /**
 * Report queue stats regularly
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _doubleendedqueue = require("double-ended-queue");
const _xev = require("xev");
const _queues = require("../queue/queues");
const _config = require("../config");
const _ = require("..");
const _queue = require("../queue");
const ev = new _xev.default();
const interval = 3000;
function _default() {
    const st = (0, _.getWorkerStrategies)(_config.default);
    const workers = st.workers + st.queues || 1;
    const log = new _doubleendedqueue();
    ev.on('requestQueueStatsLog', (x)=>{
        ev.emit(`queueStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
    });
    let activeDeliverJobs = 0;
    let activeInboxJobs = 0;
    let activeInboxLazyJobs = 0;
    let deliverDelay = null;
    let inboxDelay = null;
    let inboxLazyDelay = null;
    _queues.deliverQueue.on('global:active', async (jobId)=>{
        activeDeliverJobs++;
        if (activeDeliverJobs === 1) {
            const delay = await getDelay(_queues.deliverQueue, jobId);
            if (delay != null) deliverDelay = delay;
        }
    });
    _queues.inboxQueue.on('global:active', async (jobId)=>{
        activeInboxJobs++;
        if (activeInboxJobs === 1) {
            const delay = await getDelay(_queues.inboxQueue, jobId);
            if (delay != null) inboxDelay = delay;
        }
    });
    _queues.inboxLazyQueue.on('global:active', async (jobId)=>{
        activeInboxLazyJobs++;
        if (activeInboxLazyJobs === 1) {
            const delay = await getDelay(_queues.inboxLazyQueue, jobId);
            if (delay != null) inboxLazyDelay = delay;
        }
    });
    async function tick() {
        const deliverJobCounts = await _queues.deliverQueue.getJobCounts();
        const inboxJobCounts = await _queues.inboxQueue.getJobCounts();
        const inboxLazyJobCounts = await _queues.inboxLazyQueue.getJobCounts();
        const stats = {
            deliver: {
                limit: _queue.deliverJobConcurrency * workers,
                activeSincePrevTick: activeDeliverJobs,
                active: deliverJobCounts.active,
                waiting: deliverJobCounts.waiting,
                delayed: deliverJobCounts.delayed,
                delay: deliverDelay
            },
            inbox: {
                limit: _queue.inboxJobConcurrency * workers,
                activeSincePrevTick: activeInboxJobs,
                active: inboxJobCounts.active,
                waiting: inboxJobCounts.waiting,
                delayed: inboxJobCounts.delayed,
                delay: inboxDelay
            },
            inboxLazy: {
                limit: _queue.inboxLazyJobConcurrency * workers,
                activeSincePrevTick: activeInboxLazyJobs,
                active: inboxLazyJobCounts.active,
                waiting: inboxLazyJobCounts.waiting,
                delayed: inboxLazyJobCounts.delayed,
                delay: inboxLazyDelay
            }
        };
        ev.emit('queueStats', stats);
        log.unshift(stats);
        if (log.length > 200) log.pop();
        activeDeliverJobs = 0;
        activeInboxJobs = 0;
        activeInboxLazyJobs = 0;
    }
    tick();
    setInterval(tick, interval);
}
async function getDelay(queue, jobId) {
    var _job_opts;
    const job = await queue.getJob(jobId);
    // たまたまリトライだったら諦める
    if (job && job.attemptsMade === 0 && ((_job_opts = job.opts) === null || _job_opts === void 0 ? void 0 : _job_opts.delay) === 0 && job.processedOn) {
        const delay = job.processedOn - job.timestamp;
        return delay;
    }
    return null;
}

//# sourceMappingURL=queue-stats.js.map
