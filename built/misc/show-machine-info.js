"use strict";
Object.defineProperty(exports, "showMachineInfo", {
    enumerable: true,
    get: function() {
        return showMachineInfo;
    }
});
const _os = require("os");
const _systeminformation = require("systeminformation");
async function showMachineInfo(parentLogger) {
    const logger = parentLogger.createSubLogger('machine');
    logger.debug(`Hostname: ${_os.hostname()}`);
    logger.debug(`Platform: ${process.platform} Arch: ${process.arch}`);
    const mem = await _systeminformation.mem();
    const totalmem = (mem.total / 1024 / 1024 / 1024).toFixed(1);
    const availmem = (mem.available / 1024 / 1024 / 1024).toFixed(1);
    logger.debug(`CPU: ${_os.cpus().length} core MEM: ${totalmem}GB (available: ${availmem}GB)`);
}

//# sourceMappingURL=show-machine-info.js.map
