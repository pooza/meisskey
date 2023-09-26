"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _pollvote = require("../../../models/poll-vote");
const _note = require("../../../models/note");
const _notewatching = require("../../../models/note-watching");
const _watch = require("../../../services/note/watch");
const _stream = require("../../stream");
const _createnotification = require("../../../services/create-notification");
const _user = require("../../../models/user");
const _default = (user, note, choice)=>new Promise(async (res, rej)=>{
        if (!note.poll.choices.some((x)=>x.id == choice)) return rej('invalid choice param');
        // if already voted
        const exist = await _pollvote.default.find({
            noteId: note._id,
            userId: user._id
        });
        if (note.poll.multiple) {
            if (exist.some((x)=>x.choice === choice)) return rej('already voted');
        } else if (exist.length) {
            return rej('already voted');
        }
        // Create vote
        await _pollvote.default.insert({
            createdAt: new Date(),
            noteId: note._id,
            userId: user._id,
            choice: choice
        });
        res();
        const inc = {};
        inc[`poll.choices.${note.poll.choices.findIndex((c)=>c.id == choice)}.votes`] = 1;
        // Increment votes count
        await _note.default.update({
            _id: note._id
        }, {
            $inc: inc
        });
        (0, _stream.publishNoteStream)(note._id, 'pollVoted', {
            choice: choice,
            userId: user._id.toHexString()
        });
        // Notify
        (0, _createnotification.createNotification)(note.userId, user._id, 'poll_vote', {
            noteId: note._id,
            choice: choice
        });
        // Fetch watchers
        _notewatching.default.find({
            noteId: note._id,
            userId: {
                $ne: user._id
            },
            // 削除されたドキュメントは除く
            deletedAt: {
                $exists: false
            }
        }, {
            fields: {
                userId: true
            }
        }).then((watchers)=>{
            for (const watcher of watchers){
                (0, _createnotification.createNotification)(watcher.userId, user._id, 'poll_vote', {
                    noteId: note._id,
                    choice: choice
                });
            }
        });
        // ローカルユーザーが投票した場合この投稿をWatchする
        if ((0, _user.isLocalUser)(user) && user.settings.autoWatch !== false) {
            (0, _watch.default)(user._id, note);
        }
    });

//# sourceMappingURL=vote.js.map
