"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const _pollvote = require("../../../../../models/poll-vote");
const _note = require("../../../../../models/note");
const _notewatching = require("../../../../../models/note-watching");
const _watch = require("../../../../../services/note/watch");
const _stream = require("../../../../../services/stream");
const _createnotification = require("../../../../../services/create-notification");
const _define = require("../../../define");
const _user = require("../../../../../models/user");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const _queue = require("../../../../../queue");
const _renderer = require("../../../../../remote/activitypub/renderer");
const _vote = require("../../../../../remote/activitypub/renderer/vote");
const _update = require("../../../../../services/note/polls/update");
const _oid = require("../../../../../prelude/oid");
const meta = {
    desc: {
        'ja-JP': '指定した投稿のアンケートに投票します。',
        'en-US': 'Vote poll of a note.'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    kind: [
        'write:votes',
        'vote-write'
    ],
    params: {
        noteId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿のID',
                'en-US': 'Target note ID'
            }
        },
        choice: {
            validator: _cafy.default.num
        }
    },
    errors: {
        noSuchNote: {
            message: 'No such note.',
            code: 'NO_SUCH_NOTE',
            id: 'ecafbd2e-c283-4d6d-aecb-1a0a33b75396'
        },
        noPoll: {
            message: 'The note does not attach a poll.',
            code: 'NO_POLL',
            id: '5f979967-52d9-4314-a911-1c673727f92f'
        },
        invalidChoice: {
            message: 'Choice ID is invalid.',
            code: 'INVALID_CHOICE',
            id: 'e0cc9a04-f2e8-41e4-a5f1-4127293260cc'
        },
        alreadyVoted: {
            message: 'You have already voted.',
            code: 'ALREADY_VOTED',
            id: '0963fc77-efac-419b-9424-b391608dc6d8'
        },
        alreadyExpired: {
            message: 'The poll is already expired.',
            code: 'ALREADY_EXPIRED',
            id: '1022a357-b085-4054-9083-8f8de358337e'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const createdAt = new Date();
    // Get votee
    const note = await (0, _getters.getNote)(ps.noteId, user, true).catch((e)=>{
        if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new _error.ApiError(meta.errors.noSuchNote);
        throw e;
    });
    if (note.poll == null) {
        throw new _error.ApiError(meta.errors.noPoll);
    }
    if (note.poll.expiresAt && note.poll.expiresAt < createdAt) {
        throw new _error.ApiError(meta.errors.alreadyExpired);
    }
    if (!note.poll.choices.some((x)=>x.id == ps.choice)) {
        throw new _error.ApiError(meta.errors.invalidChoice);
    }
    // if already voted
    const exist = await _pollvote.default.find({
        noteId: note._id,
        userId: user._id
    });
    if (exist.length) {
        if (note.poll.multiple) {
            if (exist.some((x)=>x.choice == ps.choice)) throw new _error.ApiError(meta.errors.alreadyVoted);
        } else {
            throw new _error.ApiError(meta.errors.alreadyVoted);
        }
    }
    // Create vote
    const vote = await _pollvote.default.insert({
        createdAt,
        noteId: note._id,
        userId: user._id,
        choice: ps.choice
    });
    const inc = {};
    inc[`poll.choices.${note.poll.choices.findIndex((c)=>c.id == ps.choice)}.votes`] = 1;
    // Increment votes count
    await _note.default.update({
        _id: note._id
    }, {
        $inc: inc
    });
    (0, _stream.publishNoteStream)(note._id, 'pollVoted', {
        choice: ps.choice,
        userId: user._id.toHexString()
    });
    // Notify
    (0, _createnotification.createNotification)(note.userId, user._id, 'poll_vote', {
        noteId: note._id,
        choice: ps.choice
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
                choice: ps.choice
            });
        }
    });
    // この投稿をWatchする
    if (user.settings.autoWatch !== false) {
        (0, _watch.default)(user._id, note);
    }
    // 投票完了通知
    if (note.poll.expiresAt && !(0, _oid.oidEquals)(note.userId, user._id) && exist.length === 0) {
        (0, _queue.createNotifyPollFinishedJob)(note, user, note.poll.expiresAt);
    }
    // リモート投票の場合リプライ送信
    if (note._user.host != null) {
        const pollOwner = await _user.default.findOne({
            _id: note.userId
        });
        (0, _queue.deliver)(user, (0, _renderer.renderActivity)(await (0, _vote.default)(user, vote, note, pollOwner)), pollOwner.inbox);
    }
    // リモートフォロワーにUpdate配信
    (0, _update.deliverQuestionUpdate)(note._id);
    return;
});

//# sourceMappingURL=vote.js.map
