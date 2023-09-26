"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isBlockedHost: function() {
        return isBlockedHost;
    },
    isSelfSilencedHost: function() {
        return isSelfSilencedHost;
    },
    isClosedHost: function() {
        return isClosedHost;
    }
});
const _instance = require("../models/instance");
const _servereventemitter = require("./server-event-emitter");
const _converthost = require("../misc/convert-host");
const _fetchmeta = require("../misc/fetch-meta");
let blockedHosts;
let blockedHostsRegExp;
let selfSilencedHosts;
let selfSilencedHostsRegExp;
let closedHosts;
async function isBlockedHost(host) {
    var _blockedHosts_has, _this;
    if (host == null) return false;
    if (!blockedHosts) await Update();
    if ((_this = blockedHosts) === null || _this === void 0 ? void 0 : (_blockedHosts_has = _this.has) === null || _blockedHosts_has === void 0 ? void 0 : _blockedHosts_has.call(_this, (0, _converthost.toApHost)(host))) return true;
    if (blockedHostsRegExp && Array.from(blockedHostsRegExp).some((x)=>x.test((0, _converthost.toApHost)(host)))) return true;
    return false;
}
async function isSelfSilencedHost(host) {
    var _selfSilencedHosts_has, _this;
    if (host == null) return false;
    if (!selfSilencedHosts) await Update();
    if ((_this = selfSilencedHosts) === null || _this === void 0 ? void 0 : (_selfSilencedHosts_has = _this.has) === null || _selfSilencedHosts_has === void 0 ? void 0 : _selfSilencedHosts_has.call(_this, (0, _converthost.toApHost)(host))) return true;
    if (selfSilencedHostsRegExp && Array.from(selfSilencedHostsRegExp).some((x)=>x.test((0, _converthost.toApHost)(host)))) return true;
    return false;
}
async function isClosedHost(host) {
    var _closedHosts_has, _this;
    if (host == null) return false;
    if (!closedHosts) await Update();
    return (_this = closedHosts) === null || _this === void 0 ? void 0 : (_closedHosts_has = _this.has) === null || _closedHosts_has === void 0 ? void 0 : _closedHosts_has.call(_this, (0, _converthost.toApHost)(host));
}
async function Update() {
    const meta = await (0, _fetchmeta.default)();
    // block from instance/meta
    {
        const blocked = await _instance.default.find({
            isBlocked: true
        });
        const literals = new Set(blocked.map((x)=>(0, _converthost.toApHost)(x.host)));
        const regExps = new Set();
        for (const b of meta.blockedInstances || []){
            const m = b.match(/^[/](.*)[/]$/);
            if (m) {
                regExps.add(new RegExp(m[1]));
            } else {
                literals.add(b);
            }
        }
        blockedHosts = literals;
        blockedHostsRegExp = regExps;
    }
    // self-silence from meta
    {
        const literals = new Set();
        const regExps = new Set();
        for (const b of meta.selfSilencedInstances || []){
            const m = b.match(/^[/](.*)[/]$/);
            if (m) {
                regExps.add(new RegExp(m[1]));
            } else {
                literals.add(b);
            }
        }
        selfSilencedHosts = literals;
        selfSilencedHostsRegExp = regExps;
    }
    // closed from instance
    const closed = await _instance.default.find({
        isMarkedAsClosed: true
    });
    closedHosts = new Set(closed.map((x)=>(0, _converthost.toApHost)(x.host)));
}
// 初回アップデート
Update();
// 一定時間ごとにアップデート
setInterval(()=>{
    Update();
}, 300 * 1000);
// イベントでアップデート
_servereventemitter.serverEventEmitter.on('message', (parsed)=>{
    if (parsed.message.type === 'instanceModUpdated') {
        Update();
    }
});

//# sourceMappingURL=instance-moderation.js.map
