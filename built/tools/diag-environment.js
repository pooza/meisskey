"use strict";
const _os = require("os");
const _v8 = require("v8");
console.log(`Node Version: ${process.version}`);
console.log(`Node ExecPath: ${process.execPath}`);
console.log(`OS Platform: ${_os.platform()}`);
console.log(`OS Arch: ${_os.arch()}`);
console.log(`vCPU: ${_os.cpus().length}`);
console.log(`TotalMem: ${Math.floor(_os.totalmem() / 1024 / 1024)} MiB`);
console.log(`HeapSizeLimit: ${Math.floor(_v8.getHeapStatistics().heap_size_limit / 1024 / 1024)} MiB`);

//# sourceMappingURL=diag-environment.js.map
