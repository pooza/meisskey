"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _readmessagingmessage = require("../../common/read-messaging-message");
const _channel = require("../channel");
const _user = require("../../../../models/user");
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
        this.otherpartyId = params.otherparty;
        this.otherparty = await _user.default.findOne({
            _id: this.otherpartyId
        });
        // Subscribe messaging stream
        this.subscriber.on(`messagingStream:${this.user._id}-${this.otherpartyId}`, (data)=>{
            this.send(data);
        });
    }
    onMessage(type, body) {
        switch(type){
            case 'read':
                (0, _readmessagingmessage.default)(this.user._id, this.otherpartyId, body.id);
                break;
        }
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'messaging');
        _define_property(this, "otherpartyId", void 0);
        _define_property(this, "otherparty", void 0);
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

//# sourceMappingURL=messaging.js.map
