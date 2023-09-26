"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _note = require("../../../models/note");
const _notereaction = require("../../../models/note-reaction");
const _stream = require("../../stream");
const _createnotification = require("../../create-notification");
const _like = require("../../../remote/activitypub/renderer/like");
const _delivermanager = require("../../../remote/activitypub/deliver-manager");
const _renderer = require("../../../remote/activitypub/renderer");
const _reactionlib = require("../../../misc/reaction-lib");
const _packemojis = require("../../../misc/pack-emojis");
const _meta = require("../../../models/meta");
const _identifiableerror = require("../../../misc/identifiable-error");
const _config = require("../../../config");
const _blocking = require("../../../models/blocking");
const _mongodb = require("mongodb");
const _default = async (user, note, reaction, dislike = false)=>{
    // detect direction
    //   LL => local to local, LR => local to remote, RL => remote to local, RR => remote to remote
    const direction = `${(0, _user.isLocalUser)(user) ? 'L' : 'R'}${note._user.host == null ? 'L' : 'R'}`;
    // check blocking
    if ((direction === 'LL' || direction === 'RL') && note.userId !== user._id) {
        const blocked = await _blocking.default.findOne({
            blockeeId: user._id,
            blockerId: note.userId
        });
        if (blocked) {
            throw new _identifiableerror.IdentifiableError('e70412a4-7197-4726-8e74-f3e0deb92aa7');
        }
    }
    reaction = await (0, _reactionlib.toDbReaction)(reaction, true, user.host);
    const inserted = {
        _id: new _mongodb.ObjectID(),
        createdAt: new Date(),
        noteId: note._id,
        userId: user._id,
        reaction,
        dislike
    };
    if (direction !== 'RR') {
        await _notereaction.default.insert(inserted).catch((e)=>{
            if (e.code === 11000) {
                throw new _identifiableerror.IdentifiableError('51c42bb4-931a-456b-bff7-e5a8a70dd298', 'already reacted');
            } else {
                throw e;
            }
        });
    }
    // Increment reactions count / note
    await _note.default.update({
        _id: note._id
    }, {
        $inc: {
            [`reactionCounts.${reaction}`]: 1,
            score: user.isBot || inserted.dislike ? 0 : 1
        }
    });
    // Increment reactions count / stats
    incReactionsCount(user);
    const decodedReaction = (0, _reactionlib.decodeReaction)(reaction);
    const emoji = (await (0, _packemojis.packEmojis)([
        decodedReaction.replace(/:/g, '')
    ], note._user.host))[0];
    (0, _stream.publishNoteStream)(note._id, 'reacted', {
        reaction: decodedReaction,
        emoji: emoji,
        userId: user._id
    });
    if (note.reactionCounts == null) {
        (async ()=>{
            const fresh = await _note.default.findOne({
                _id: note._id
            });
            (0, _stream.publishHotStream)(await (0, _note.pack)(fresh));
        })();
    }
    // リアクションされたユーザーがローカルユーザーなら通知を作成
    if ((0, _user.isLocalUser)(note._user)) {
        (0, _createnotification.createNotification)(note.userId, user._id, 'reaction', {
            noteId: note._id,
            reaction: reaction
        });
    }
    //#region 配信
    if ((0, _user.isLocalUser)(user) && !note.localOnly && !user.noFederation) {
        const content = (0, _renderer.renderActivity)(await (0, _like.renderLike)(inserted, note), user);
        const dm = new _delivermanager.default(user, content);
        if ((0, _user.isRemoteUser)(note._user)) {
            const reactee = await _user.default.findOne({
                _id: note.userId
            });
            if ((0, _user.isRemoteUser)(reactee)) dm.addDirectRecipe(reactee);
        }
        if (!_config.default.disableLikeBroadcast && [
            'public',
            'home'
        ].includes(note.visibility)) {
            dm.addFollowersRecipe();
        }
        dm.execute(true);
    }
    //#endregion
    return inserted;
};
function incReactionsCount(user) {
    if ((0, _user.isLocalUser)(user)) {
        _meta.default.update({}, {
            $inc: {
                'stats.reactionsCount': 1
            }
        }, {
            upsert: true
        });
    } else {
    /*
		Meta.update({}, {
			$inc: {
				'stats.originalReactionsCount': 1
			}
		}, { upsert: true });
		*/ }
}

//# sourceMappingURL=create.js.map
