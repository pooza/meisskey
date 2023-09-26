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
        // Subscribe events
        this.subscriber.on('hotStream', this.onNewNote);
    }
    async onNewNote(note) {
        var _note_fileIds;
        // reply除外
        if (note.replyId != null) return;
        // Renote除外
        if (note.renoteId && !note.text && !((_note_fileIds = note.fileIds) === null || _note_fileIds === void 0 ? void 0 : _note_fileIds.length) && !note.poll) {
            return;
        }
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
        // 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
        if ((0, _shouldmutethisnote.default)(note, this.mutedUserIds)) return;
        this.send('note', note);
    }
    dispose() {
        // Unsubscribe events
        this.subscriber.off('hotStream', this.onNewNote);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'hotTimeline');
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
        Object
    ])
], _class.prototype, "onNewNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "dispose", null);

//# sourceMappingURL=hot-timeline.js.map
