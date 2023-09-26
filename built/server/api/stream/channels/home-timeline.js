"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _note = require("../../../../models/note");
const _shouldmutethisnote = require("../../../../misc/should-mute-this-note");
const _channel = require("../channel");
const _array = require("../../../../prelude/array");
const _userlist = require("../../../../models/user-list");
const _converthost = require("../../../../misc/convert-host");
const _following = require("../../../../models/following");
const _oid = require("../../../../prelude/oid");
const _userfilter = require("../../../../models/user-filter");
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
        var _params;
        await this.updateFollowing();
        await this.updateFilter();
        this.includeForeignReply = !!((_params = params) === null || _params === void 0 ? void 0 : _params.includeForeignReply);
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
    async updateFilter() {
        // Homeから隠すリストユーザー
        const lists = await _userlist.default.find({
            userId: this.user._id,
            hideFromHome: true
        });
        this.hideFromUsers = (0, _array.concat)(lists.map((list)=>list.userIds)).map((x)=>x.toString());
        this.hideFromHosts = (0, _array.concat)(lists.map((list)=>list.hosts || [])).map((x)=>(0, _converthost.isSelfHost)(x) ? null : x);
        const hideRenotes = await _userfilter.default.find({
            ownerId: this.user._id,
            hideRenote: true
        });
        this.hideRenoteUsers = hideRenotes.map((hideRenote)=>hideRenote.targetId).map((x)=>x.toString());
    }
    async onServerEvent(data) {
        if (data.type === 'followingChanged') {
            this.updateFollowing();
        }
        if (data.type === 'filterChanged') {
            this.updateFilter();
        }
    }
    async onNote(note) {
        var _note_fileIds;
        if (!((0, _oid.oidEquals)(note.userId, this.user._id) || // myself
        (0, _oid.oidIncludes)(this.followingIds, note.userId) || // from followers
        (0, _oid.oidIncludes)(note.mentions, this.user._id) // mentions
        )) return;
        // フォロワー限定以下なら現在のユーザー情報で再度除外
        if ([
            'followers',
            'specified'
        ].includes(note.visibility)) {
            note = await (0, _note.pack)(note.id, this.user, {
                detail: true
            });
            if (note.isHidden) {
                return;
            }
        }
        // リプライなら再pack
        if (note.replyId != null) {
            note.reply = await (0, _note.pack)(note.replyId, this.user, {
                detail: true
            });
        }
        // Renoteなら再pack
        if (note.renoteId != null) {
            note.renote = await (0, _note.pack)(note.renoteId, this.user, {
                detail: true
            });
        }
        // 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
        if ((0, _shouldmutethisnote.default)(note, this.mutedUserIds, this.hideFromUsers, this.hideFromHosts)) return;
        // Renoteを隠すユーザー
        if (note.renoteId && !note.text && !((_note_fileIds = note.fileIds) === null || _note_fileIds === void 0 ? void 0 : _note_fileIds.length) && !note.poll) {
            if ((0, _oid.oidIncludes)(this.hideRenoteUsers, note.userId)) return;
        }
        if (!this.includeForeignReply && note.replyId) {
            if (!((0, _oid.oidEquals)(note.userId, note.reply.userId) || (0, _oid.oidEquals)(this.user._id, note.reply.userId) // to me
             || (0, _oid.oidEquals)(this.user._id, note.userId) // my post
            )) return;
        }
        this.send('note', note);
    }
    dispose() {
        // Unsubscribe events
        this.subscriber.off('notesStream', this.onNote);
        this.subscriber.off(`serverEvent:${this.user._id}`, this.onServerEvent);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'homeTimeline');
        _define_property(this, "hideFromUsers", []);
        _define_property(this, "hideFromHosts", []);
        _define_property(this, "hideRenoteUsers", []);
        _define_property(this, "followingIds", []);
        _define_property(this, "includeForeignReply", false);
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
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "updateFilter", null);
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

//# sourceMappingURL=home-timeline.js.map
