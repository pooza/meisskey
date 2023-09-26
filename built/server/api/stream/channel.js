"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Channel;
    }
});
const _autobinddecorator = require("autobind-decorator");
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
let Channel = class Channel {
    get user() {
        return this.connection.user;
    }
    get mutedUserIds() {
        return this.connection.muting;
    }
    get subscriber() {
        return this.connection.subscriber;
    }
    send(typeOrPayload, payload) {
        const type = payload === undefined ? typeOrPayload.type : typeOrPayload;
        const body = payload === undefined ? typeOrPayload.body : payload;
        this.connection.sendMessageToWs('channel', {
            id: this.id,
            type: type,
            body: body
        });
    }
    constructor(id, connection){
        _define_property(this, "connection", void 0);
        _define_property(this, "id", void 0);
        this.id = id;
        this.connection = connection;
    }
};
_define_property(Channel, "requireCredential", void 0);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ])
], Channel.prototype, "send", null);

//# sourceMappingURL=channel.js.map
