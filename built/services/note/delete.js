"use strict";
Object.defineProperty(exports, /**
 * 投稿を削除します。
 * @param user 投稿者
 * @param note 投稿
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _note = require("../../models/note");
const _user = require("../../models/user");
const _stream = require("../stream");
const _delete = require("../../remote/activitypub/renderer/delete");
const _undo = require("../../remote/activitypub/renderer/undo");
const _renderer = require("../../remote/activitypub/renderer");
const _tombstone = require("../../remote/activitypub/renderer/tombstone");
const _announce = require("../../remote/activitypub/renderer/announce");
const _notes = require("../../services/chart/notes");
const _perusernotes = require("../../services/chart/per-user-notes");
const _config = require("../../config");
const _noteunread = require("../../models/note-unread");
const _read = require("./read");
const _drivefile = require("../../models/drive-file");
const _registerorfetchinstancedoc = require("../register-or-fetch-instance-doc");
const _instance = require("../../models/instance");
const _instance1 = require("../../services/chart/instance");
const _favorite = require("../../models/favorite");
const _delivermanager = require("../../remote/activitypub/deliver-manager");
const _relay = require("../relay");
const _notification = require("../../models/notification");
const _deleteunusedfile = require("../drive/delete-unused-file");
const _isquote = require("../../misc/is-quote");
const _notereaction = require("../../models/note-reaction");
async function _default(user, note, quiet = false) {
    const deletedAt = new Date();
    await _note.default.update({
        _id: note._id,
        userId: user._id
    }, {
        $set: {
            deletedAt: deletedAt,
            text: null,
            mecabWords: [],
            trendWords: [],
            tags: [],
            fileIds: [],
            renoteId: null,
            poll: null,
            geo: null,
            cw: null
        }
    });
    if (note.renoteId) {
        _note.default.update({
            _id: note.renoteId
        }, {
            $inc: {
                renoteCount: -1,
                quoteCount: (0, _isquote.default)(note) ? -1 : 0,
                score: user.isBot ? 0 : -1
            },
            $pull: {
                _quoteIds: note._id
            }
        });
    }
    // この投稿が関わる未読通知を削除
    _noteunread.default.find({
        noteId: note._id
    }).then((unreads)=>{
        for (const unread of unreads){
            (0, _read.default)(unread.userId, unread.noteId);
        }
    });
    // この投稿をお気に入りから削除
    _favorite.default.remove({
        noteId: note._id
    });
    _notification.default.remove({
        noteId: note._id
    });
    _notereaction.default.remove({
        noteId: note._id
    });
    // ファイルが添付されていた場合ドライブのファイルの「このファイルが添付された投稿一覧」プロパティからこの投稿を削除
    if (note.fileIds) {
        for (const fileId of note.fileIds){
            _drivefile.default.update({
                _id: fileId
            }, {
                $pull: {
                    'metadata.attachedNoteIds': note._id
                }
            });
            // リモートユーザーの場合はもう参照されてないファイルか確認
            if ((0, _user.isRemoteUser)(user)) {
                (0, _deleteunusedfile.deleteUnusedFile)(fileId);
            }
        }
    }
    // このNoteに対するPureRenoteを削除
    _note.default.remove({
        $and: [
            {
                renoteId: note._id
            },
            {
                text: null
            },
            {
                fileIds: []
            },
            {
                poll: null
            }
        ]
    }, {
        multi: true
    });
    if (!quiet) {
        (0, _stream.publishNoteStream)(note._id, 'deleted', {
            deletedAt: deletedAt
        });
        // renote解除の場合は、renote解除されたnoteに向けてunrenoted
        if (note.renoteId) {
            (0, _stream.publishNoteStream)(note.renoteId, 'unrenoted', {
                renoteeId: user._id // renote解除した人
            });
        }
        //#region ローカルの投稿なら削除アクティビティを配送
        if ((0, _user.isLocalUser)(user) && !note.localOnly) {
            (async ()=>{
                var _note__renote;
                let renote;
                if (note.renoteId && note.text == null && note.poll == null && (note.fileIds == null || note.fileIds.length == 0)) {
                    renote = await _note.default.findOne({
                        _id: note.renoteId
                    });
                }
                const content = (0, _renderer.renderActivity)(renote ? (0, _undo.default)((0, _announce.default)(renote.uri || `${_config.default.url}/notes/${renote._id}`, note), user) : (0, _delete.default)((0, _tombstone.default)(`${_config.default.url}/notes/${note._id}`), user, `${_config.default.url}/notes/${note._id}/delete`));
                (0, _delivermanager.deliverToFollowers)(user, content);
                (0, _relay.deliverToRelays)(user, content);
                const dm = new _delivermanager.default(user, content);
                // メンションされたリモートユーザーに配送 (Replay, DM 含む)
                for (const u of note.mentionedRemoteUsers || []){
                    const user = await _user.default.findOne({
                        uri: u.uri
                    });
                    if (user) dm.addDirectRecipe(user);
                }
                // 投稿がRenote/QuoteかつRenote元の投稿の投稿者がリモートユーザーなら配送
                if (note.renoteId && ((_note__renote = note._renote) === null || _note__renote === void 0 ? void 0 : _note__renote.userId)) {
                    const user = await _user.default.findOne({
                        _id: note._renote.userId
                    });
                    if (user) dm.addDirectRecipe(user);
                }
                dm.execute();
            })();
        }
        //#endregion
        // 統計を更新
        _notes.default.update(note, false);
        _perusernotes.default.update(user, note, false);
        if ((0, _user.isRemoteUser)(user)) {
            (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(user.host).then((i)=>{
                _instance.default.update({
                    _id: i._id
                }, {
                    $inc: {
                        notesCount: -1
                    }
                });
                _instance1.default.updateNote(i.host, false);
            });
        }
    }
}

//# sourceMappingURL=delete.js.map
