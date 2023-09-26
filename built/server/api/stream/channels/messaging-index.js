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
        // Subscribe messaging index stream
        this.subscriber.on(`messagingIndexStream:${this.user._id}`, (data)=>{
            this.send(data);
        });
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'messagingIndex');
    }
};
_define_property(_class, "requireCredential", true);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "init", null);

//# sourceMappingURL=messaging-index.js.map