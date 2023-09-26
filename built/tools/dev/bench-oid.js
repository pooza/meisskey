"use strict";
const _meid7 = require("../../misc/id/meid7");
const _oid = require("../../prelude/oid");
const _mongodb = require("mongodb");
const _perf_hooks = require("perf_hooks");
const follows = [];
const excepts = [];
const excepts2 = [];
// gen ids
for(let i = 0; i < 2000; i++){
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(new Date()));
    follows.push(id);
    if (i % 2 === 0) excepts.push(id);
}
for(let i = 0; i < 2000; i++){
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(new Date()));
    excepts2.push(id);
}
const begin = _perf_hooks.performance.now();
follows.filter((x)=>!(0, _oid.oidIncludes)(excepts, x)).filter((x)=>!(0, _oid.oidIncludes)(excepts2, x));
const after = _perf_hooks.performance.now();
console.log(after - begin);

//# sourceMappingURL=bench-oid.js.map
