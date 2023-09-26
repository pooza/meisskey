"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _mongodb = require("mongodb");
const _matching = require("../../../../../models/games/reversi/matching");
const _stream = require("../../../../../services/stream");
const _channel = require("../../channel");
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
        // Subscribe reversi stream
        this.subscriber.on(`reversiStream:${this.user._id}`, (data)=>{
            this.send(data);
        });
    }
    async onMessage(type, body) {
        switch(type){
            case 'ping':
                if (body.id == null) return;
                const matching = await _matching.default.findOne({
                    parentId: this.user._id,
                    childId: new _mongodb.ObjectID(body.id)
                });
                if (matching == null) return;
                (0, _stream.publishMainStream)(matching.childId, 'reversiInvited', await (0, _matching.pack)(matching, matching.childId));
                break;
        }
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'gamesReversi');
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
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], _class.prototype, "onMessage", null);

//# sourceMappingURL=reversi.js.map
