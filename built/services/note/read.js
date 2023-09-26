"use strict";
Object.defineProperty(exports, /**
 * Mark a note as read
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _isobjectid = require("../../misc/is-objectid");
const _stream = require("../stream");
const _user = require("../../models/user");
const _noteunread = require("../../models/note-unread");
const _gethideusers = require("../../server/api/common/get-hide-users");
const _default = (user, note)=>new Promise(async (resolve, reject)=>{
        const userId = (0, _isobjectid.default)(user) ? user : new _mongodb.ObjectID(user);
        const noteId = (0, _isobjectid.default)(note) ? note : new _mongodb.ObjectID(note);
        // Remove document
        const res = await _noteunread.default.remove({
            userId: userId,
            noteId: noteId
        });
        if (res.deletedCount == 0) {
            return;
        }
        const hideUserIds = await (0, _gethideusers.getHideUserIdsById)(user, false, true);
        const count1 = await _noteunread.default.count({
            userId: userId,
            '_note.userId': {
                $nin: hideUserIds
            },
            isSpecified: false
        }, {
            limit: 1
        });
        const count2 = await _noteunread.default.count({
            userId: userId,
            '_note.userId': {
                $nin: hideUserIds
            },
            isSpecified: true
        }, {
            limit: 1
        });
        if (count1 == 0 || count2 == 0) {
            _user.default.update({
                _id: userId
            }, {
                $set: {
                    hasUnreadMentions: count1 != 0 || count2 != 0,
                    hasUnreadSpecifiedNotes: count2 != 0
                }
            });
        }
        if (count1 == 0) {
            // 全て既読になったイベントを発行
            (0, _stream.publishMainStream)(userId, 'readAllUnreadMentions');
        }
        if (count2 == 0) {
            // 全て既読になったイベントを発行
            (0, _stream.publishMainStream)(userId, 'readAllUnreadSpecifiedNotes');
        }
    });

//# sourceMappingURL=read.js.map
