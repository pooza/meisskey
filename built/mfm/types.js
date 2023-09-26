"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isMfmMention: function() {
        return isMfmMention;
    },
    isMfmHashtag: function() {
        return isMfmHashtag;
    },
    isMfmEmoji: function() {
        return isMfmEmoji;
    },
    isMfmCustomEmoji: function() {
        return isMfmCustomEmoji;
    },
    isMfmUnicodeEmoji: function() {
        return isMfmUnicodeEmoji;
    },
    isMfmLink: function() {
        return isMfmLink;
    }
});
const isMfmMention = (node)=>node.type === 'mention';
const isMfmHashtag = (node)=>node.type === 'hashtag';
const isMfmEmoji = (node)=>node.type === 'emoji';
const isMfmCustomEmoji = (node)=>isMfmEmoji(node) && node.props.name != null;
const isMfmUnicodeEmoji = (node)=>isMfmEmoji(node) && node.props.emoji != null;
const isMfmLink = (node)=>node.type === 'link';

//# sourceMappingURL=types.js.map
