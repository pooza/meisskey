"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    addPinned: function() {
        return addPinned;
    },
    removePinned: function() {
        return removePinned;
    },
    deliverPinnedChange: function() {
        return deliverPinnedChange;
    }
});
const _config = require("../../config");
const _user = require("../../models/user");
const _note = require("../../models/note");
const _add = require("../../remote/activitypub/renderer/add");
const _remove = require("../../remote/activitypub/renderer/remove");
const _renderer = require("../../remote/activitypub/renderer");
const _identifiableerror = require("../../misc/identifiable-error");
const _delivermanager = require("../../remote/activitypub/deliver-manager");
const _relay = require("../relay");
async function addPinned(user, noteId) {
    // Fetch pinee
    const note = await _note.default.findOne({
        _id: noteId,
        visibility: {
            $in: [
                'public',
                'home'
            ]
        },
        localOnly: {
            $ne: true
        },
        userId: user._id
    });
    if (note === null) {
        throw new _identifiableerror.IdentifiableError('70c4e51f-5bea-449c-a030-53bee3cce202', 'No such note.');
    }
    let pinnedNoteIds = user.pinnedNoteIds || [];
    //#region 現在ピン留め投稿している投稿が実際にデータベースに存在しているのかチェック
    // データベースの欠損などで存在していない(または破損している)場合があるので。
    // 存在していなかったらピン留め投稿から外す
    let pinnedNotes = await (0, _note.packMany)(pinnedNoteIds, null, {
        detail: true,
        removeError: true
    });
    // 削除済みもこのタイミングで消してしまう
    pinnedNotes = pinnedNotes.filter((x)=>!x.deletedAt);
    pinnedNoteIds = pinnedNoteIds.filter((id)=>pinnedNotes.some((n)=>id.equals(n.id)));
    //#endregion
    if (pinnedNoteIds.length >= 5) {
        throw new _identifiableerror.IdentifiableError('15a018eb-58e5-4da1-93be-330fcc5e4e1a', 'You can not pin notes any more.');
    }
    if (pinnedNoteIds.some((id)=>id.equals(note._id))) {
        throw new _identifiableerror.IdentifiableError('23f0cf4e-59a3-4276-a91d-61a5891c1514', 'That note has already been pinned.');
    }
    pinnedNoteIds.unshift(note._id);
    await _user.default.update(user._id, {
        $set: {
            pinnedNoteIds: pinnedNoteIds
        }
    });
    // Deliver to remote followers
    if ((0, _user.isLocalUser)(user)) {
        deliverPinnedChange(user._id, note._id, true);
    }
}
async function removePinned(user, noteId) {
    // Fetch unpinee
    const note = await _note.default.findOne({
        _id: noteId,
        userId: user._id
    });
    if (note === null) {
        throw new _identifiableerror.IdentifiableError('b302d4cf-c050-400a-bbb3-be208681f40c', 'No such note.');
    }
    const pinnedNoteIds = (user.pinnedNoteIds || []).filter((id)=>!id.equals(note._id));
    await _user.default.update(user._id, {
        $set: {
            pinnedNoteIds: pinnedNoteIds
        }
    });
    // Deliver to remote followers
    if ((0, _user.isLocalUser)(user)) {
        deliverPinnedChange(user._id, noteId, false);
    }
}
async function deliverPinnedChange(userId, noteId, isAddition) {
    const user = await _user.default.findOne({
        _id: userId
    });
    if (!(0, _user.isLocalUser)(user)) return;
    const target = `${_config.default.url}/users/${user._id}/collections/featured`;
    const item = `${_config.default.url}/notes/${noteId}`;
    const content = (0, _renderer.renderActivity)(isAddition ? (0, _add.default)(user, target, item) : (0, _remove.default)(user, target, item));
    (0, _delivermanager.deliverToFollowers)(user, content);
    (0, _relay.deliverToRelays)(user, content);
}

//# sourceMappingURL=pin.js.map
