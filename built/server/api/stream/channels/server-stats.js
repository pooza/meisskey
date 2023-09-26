"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _xev = require("xev");
const _channel = require("../channel");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const ev = new _xev.default();
let _class = class _class extends _channel.default {
    async init(params) {
        ev.addListener('serverStats', this.onStats);
    }
    onStats(stats) {
        this.send('stats', stats);
    }
    onMessage(type, body) {
        switch(type){
            case 'requestLog':
                ev.once(`serverStatsLog:${body.id}`, (statsLog)=>{
                    this.send('statsLog', statsLog);
                });
                ev.emit('requestServerStatsLog', {
                    id: body.id,
                    length: body.length
                });
                break;
        }
    }
    dispose() {
        ev.removeListener('serverStats', this.onStats);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'serverStats');
    }
};
_define_property(_class, "requireCredential", false);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "init", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "onStats", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], _class.prototype, "onMessage", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "dispose", null);

//# sourceMappingURL=server-stats.js.map
