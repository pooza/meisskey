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
const _fetchmeta = require("../../../../misc/fetch-meta");
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
        const meta = await (0, _fetchmeta.default)();
        if (meta.disableLocalTimeline) {
            return;
        }
        if (!this.user && meta.disableTimelinePreview) {
            return;
        }
        this.showReplayInPublicTimeline = meta.showReplayInPublicTimeline;
        // Subscribe events
        this.subscriber.on('notesStream', this.onNote);
    }
    async onNote(note) {
        var _note_renote_user, _note_renote;
        if (note.visibility !== 'public') return;
        if (note.user.host != null) return;
        if (!this.showReplayInPublicTimeline && note.replyId) return;
        if (note.hasRemoteMentions) return;
        // Renoteなら再pack
        if (note.renoteId != null) {
            note.renote = await (0, _note.pack)(note.renoteId, this.user, {
                detail: true
            });
        }
        if ((_note_renote_user = (_note_renote = note.renote) === null || _note_renote === void 0 ? void 0 : _note_renote.user) === null || _note_renote_user === void 0 ? void 0 : _note_renote_user.host) return;
        // 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
        if ((0, _shouldmutethisnote.default)(note, this.mutedUserIds)) return;
        this.send('note', note);
    }
    dispose() {
        // Unsubscribe events
        this.subscriber.off('notesStream', this.onNote);
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'localTimeline');
        _define_property(this, "showReplayInPublicTimeline", false);
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
    _ts_metadata("design:paramtypes", [
        typeof _packedschemas.PackedNote === "undefined" ? Object : _packedschemas.PackedNote
    ])
], _class.prototype, "onNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], _class.prototype, "dispose", null);

//# sourceMappingURL=local-timeline.js.map
