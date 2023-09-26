"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _channel = require("../channel");
const _note = require("../../../../models/note");
const _shouldmutethisnote = require("../../../../misc/should-mute-this-note");
const _userlist = require("../../../../models/user-list");
const _config = require("../../../../config");
const _userfilter = require("../../../../models/user-filter");
const _oid = require("../../../../prelude/oid");
const _following = require("../../../../models/following");
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
        this.listId = params.listId;
        await this.refreshLists();
        const followings = await _following.default.find({
            followerId: this.user._id
        });
        this.followingIds = followings.map((x)=>`${x.followeeId}`);
        this.includeForeignReply = !!((_params = params) === null || _params === void 0 ? void 0 : _params.includeForeignReply);
        // Subscribe stream
        if (this.list) {
            this.subscriber.on(`userListStream:${this.listId}`, this.send);
            this.subscriber.on('notesStream', this.onNote);
            this.refreshClock = setInterval(this.refreshLists, 60000);
        }
    }
    async refreshLists() {
        const hideRenotes = await _userfilter.default.find({
            ownerId: this.user._id,
            hideRenote: true
        });
        this.hideRenoteUsers = hideRenotes.map((hideRenote)=>hideRenote.targetId).map((x)=>x.toString());
        this.list = await _userlist.default.findOne({
            _id: this.listId,
            userId: this.user._id
        });
    }
    async onNote(note) {
        var _note_fileIds;
        if (this.list.mediaOnly) {
            const medias = [
                'image/jpeg',
                'image/png',
                'image/apng',
                'image/gif',
                'image/webp',
                'image/avif',
                'video/mp4',
                'video/webm'
            ];
            const types = (note.files || []).map((x)=>x.type);
            if (!medias.some((x)=>types.includes(x))) return;
        }
        if (!(this.list.hosts && this.list.hosts.includes('*') || this.list.userIds.some((userId)=>`${note.userId}` === `${userId}`) || this.list.hosts && this.list.hosts.includes(note.user.host || _config.default.host))) return;
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
        if ((0, _shouldmutethisnote.default)(note, this.mutedUserIds)) return;
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
        if (this.list) {
            this.subscriber.off(`userListStream:${this.listId}`, this.send);
            this.subscriber.off('notesStream', this.onNote);
            clearInterval(this.refreshClock);
        }
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'userList');
        _define_property(this, "listId", void 0);
        _define_property(this, "list", null);
        _define_property(this, "hideRenoteUsers", []);
        _define_property(this, "followingIds", []);
        _define_property(this, "includeForeignReply", false);
        _define_property(this, "refreshClock", void 0);
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
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "refreshLists", null);
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

//# sourceMappingURL=user-list.js.map
