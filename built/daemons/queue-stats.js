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
const ev = new _xev.default();
const interval = 3000;
function _default() {
    const st = (0, _.getWorkerStrategies)(_config.default);
    const workers = st.workers + st.queues || 1;
    const deliverConcurrencyPerWorker = _config.default.deliverJobConcurrency || 128;
    const inboxConcurrencyPerWorker = _config.default.inboxJobConcurrency || 16;
    const log = new _doubleendedqueue();
    ev.on('requestQueueStatsLog', (x)=>{
        ev.emit(`queueStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
    });
    let activeDeliverJobs = 0;
    let activeInboxJobs = 0;
    _queues.deliverQueue.on('global:active', ()=>{
        activeDeliverJobs++;
    });
    _queues.inboxQueue.on('global:active', ()=>{
        activeInboxJobs++;
    });
    async function tick() {
        const deliverJobCounts = await _queues.deliverQueue.getJobCounts();
        const inboxJobCounts = await _queues.inboxQueue.getJobCounts();
        const stats = {
            deliver: {
                limit: deliverConcurrencyPerWorker * workers,
                activeSincePrevTick: activeDeliverJobs,
                active: deliverJobCounts.active,
                waiting: deliverJobCounts.waiting,
                delayed: deliverJobCounts.delayed
            },
            inbox: {
                limit: inboxConcurrencyPerWorker * workers,
                activeSincePrevTick: activeInboxJobs,
                active: inboxJobCounts.active,
                waiting: inboxJobCounts.waiting,
                delayed: inboxJobCounts.delayed
            }
        };
        ev.emit('queueStats', stats);
        log.unshift(stats);
        if (log.length > 200) log.pop();
        activeDeliverJobs = 0;
        activeInboxJobs = 0;
    }
    tick();
    setInterval(tick, interval);
}

//# sourceMappingURL=queue-stats.js.map
