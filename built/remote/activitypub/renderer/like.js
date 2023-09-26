"use strict";
Object.defineProperty(exports, "renderLike", {
    enumerable: true,
    get: function() {
        return renderLike;
    }
});
const _config = require("../../../config");
const _emoji = require("../../../models/emoji");
const _emoji1 = require("./emoji");
const renderLike = async (noteReaction, note)=>{
    const reaction = generalMap[noteReaction.reaction] || noteReaction.reaction;
    const object = {
        type: noteReaction.dislike ? 'Dislike' : 'Like',
        id: `${_config.default.url}/likes/${noteReaction._id}`,
        actor: `${_config.default.url}/users/${noteReaction.userId}`,
        object: note.uri ? note.uri : `${_config.default.url}/notes/${noteReaction.noteId}`,
        content: reaction,
        _misskey_reaction: reaction
    };
    if (reaction.startsWith(':')) {
        const name = reaction.replace(/:/g, '');
        const emoji = await _emoji.default.findOne({
            name,
            host: null
        });
        if (emoji) object.tag = [
            (0, _emoji1.default)(emoji)
        ];
    }
    return object;
};
const generalMap = {
    'like': '👍',
    'love': '❤',
    'laugh': '😆',
    'hmm': '🤔',
    'surprise': '😮',
    'congrats': '🎉',
    'angry': '💢',
    'confused': '😥',
    'rip': '😇',
    'pudding': '🍮',
    'star': '⭐'
};

//# sourceMappingURL=like.js.map
