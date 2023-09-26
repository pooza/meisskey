"use strict";
Object.defineProperty(exports, /**
 * Report server stats regularly
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _os = require("os");
const _systeminformation = require("systeminformation");
const _doubleendedqueue = require("double-ended-queue");
const _xev = require("xev");
const _osutils = require("os-utils");
const _config = require("../config");
const ev = new _xev.default();
const interval = 3000;
function _default() {
    const log = new _doubleendedqueue();
    ev.on('requestServerStatsLog', (x)=>{
        ev.emit(`serverStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
    });
    async function tick() {
        const cpu = await cpuUsage();
        const mem = await _systeminformation.mem();
        const fsStats = await _systeminformation.fsSize();
        const cpuSpeed = (await _systeminformation.cpuCurrentSpeed()).avg;
        const disk = {
            available: fsStats[0].available,
            free: fsStats[0].available,
            total: fsStats[0].size
        };
        mem.used = mem.used - mem.buffers - mem.cached;
        // |- used -|- buffer-|- cache -|- free -|
        // |-- active --|-- available --|- free -|
        const stats = {
            cpu_usage: cpu,
            cpu_speed: cpuSpeed,
            mem,
            disk,
            os_uptime: _os.uptime(),
            process_uptime: process.uptime()
        };
        ev.emit('serverStats', stats);
        log.unshift(stats);
        if (log.length > 200) log.pop();
    }
    if (_config.default.hideServerInfo) return;
    tick();
    setInterval(tick, interval);
}
// CPU STAT
function cpuUsage() {
    return new Promise((res, rej)=>{
        try {
            _osutils.cpuUsage((cpuUsage)=>{
                res(cpuUsage);
            });
        } catch (e) {
            rej(e);
        }
    });
}

//# sourceMappingURL=server-stats.js.map
