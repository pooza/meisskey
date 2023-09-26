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
        // Subscribe main stream channel
        this.subscriber.on(`mainStream:${this.user._id}`, async (data)=>{
            // filter
            if (data.type === 'notification') {
                var _notification_note;
                const notification = data.body;
                if (this.mutedUserIds.includes(notification.userId)) return;
                if ((_notification_note = notification.note) === null || _notification_note === void 0 ? void 0 : _notification_note.isHidden) return;
            }
            if (data.type === 'mention') {
                const note = data.body;
                if (this.mutedUserIds.includes(note.userId)) return;
                if (note.isHidden) return;
            }
            this.send(data.type, data.body);
        });
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'main');
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

//# sourceMappingURL=main.js.map
