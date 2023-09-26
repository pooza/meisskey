"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _shouldmutethisnote = require("../../../../misc/should-mute-this-note");
const _channel = require("../channel");
const _following = require("../../../../models/following");
const _oid = require("../../../../prelude/oid");
const _packedschemas = require("../../../../models/packed-schemas");
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
        await this.updateFollowing();
        // Subscribe events
        this.subscriber.on('notesStream', this.onNote);
        this.subscriber.on(`serverEvent:${this.user._id}`, this.onServerEvent);
    }
    async updateFollowing() {
        const followings = await _following.default.find({
            followerId: this.user._id
        });
        this.followingIds = followings.map((x)=>`${x.followeeId}`);
    }
    async onServerEvent(data) {
        if (data.type === 'followingChanged') {
            this.updateFollowing();
        }
    }
    async onNote(note) {
        var _this_user;
        if (note.visibility !== 'public') return;
        if (note.replyId) return;
        if ((0, _oid.oidIncludes)(this.followingIds, note.userId)) return;
        if ((0, _oid.oidEquals)((_this_user = this.user) === null || _this_user === void 0 ? void 0 : _this_user._id, note.userId)) return;
        // 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
        if ((0, _shouldmutethisnote.default)(note, this.mutedUserIds)) return;
        this.send('note', note);
    }
    dispose() {
        // Unsubscribe events
        this.subscriber.off('notesStream', this.onNote);
        this.subscriber.off(`serverEvent:${this.user._id}`, this.onServerEvent);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'anotherTimeline');
        _define_property(this, "followingIds", []);
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
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "updateFollowing", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "onServerEvent", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _packedschemas.PackedNote === "undefined" ? Object : _packedschemas.PackedNote
    ])
], _class.prototype, "onNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "dispose", null);

//# sourceMappingURL=another-timeline.js.map
