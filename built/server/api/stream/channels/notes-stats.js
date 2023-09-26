"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
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
let _class = class _class extends _channel.default {
    async init(params) {
        this.subscriber.on('notesStream', this.onNote);
        this.timerId = setInterval(this.onStats, 3000);
    }
    onNote(note) {
        this.stats.all++;
        if (note.user.host == null) this.stats.local++;
    }
    onStats() {
        this.send('stats', this.stats);
        this.stats = {
            all: 0,
            local: 0
        };
    }
    onMessage(type, body) {
        switch(type){
            case 'requestLog':
                this.send('statsLog', []);
                break;
        }
    }
    dispose() {
        if (this.timerId) clearInterval(this.timerId);
        this.subscriber.off('notesStream', this.onNote);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'notesStats');
        _define_property(this, "stats", {
            all: 0,
            local: 0
        });
        _define_property(this, "timerId", void 0);
    }
};
_define_property(_class, "shouldShare", true);
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
], _class.prototype, "onNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
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

//# sourceMappingURL=notes-stats.js.map
