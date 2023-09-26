"use strict";
Object.defineProperty(exports, /**
 * 対象のNoteをミュートする必要があるか
 * @param note 対象のPackedNote
 * @param mutedUserIds ミュートしているユーザーID
 * @param hideFromUsers Hide指定のあるユーザーID
 * @param hideFromHosts Hide指定のあるホスト
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _oid = require("../prelude/oid");
function _default(note, mutedUserIds, hideFromUsers, hideFromHosts) {
    // ミュートしているユーザーの投稿
    if ((0, _oid.oidIncludes)(mutedUserIds, note.userId)) {
        return true;
    }
    // ミュートしているユーザーへのリプライ
    if (note.reply != null && (0, _oid.oidIncludes)(mutedUserIds, note.reply.userId)) {
        return true;
    }
    // ミュートしているユーザーへのRenote/Quote
    if (note.renote != null && (0, _oid.oidIncludes)(mutedUserIds, note.renote.userId)) {
        return true;
    }
    // Hide指定のユーザー
    if (hideFromUsers && (0, _oid.oidIncludes)(hideFromUsers, note.userId)) {
        return true;
    }
    // Hide指定のホスト
    if (hideFromHosts && hideFromHosts.includes(note.user.host)) {
        return true;
    }
    return false;
}

//# sourceMappingURL=should-mute-this-note.js.map
