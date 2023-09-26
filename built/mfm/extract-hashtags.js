"use strict";
Object.defineProperty(exports, "extractHashtags", {
    enumerable: true,
    get: function() {
        return extractHashtags;
    }
});
const _types = require("../mfm/types");
const _utils = require("./utils");
function extractHashtags(nodes) {
    const hashtags = new Set();
    for (const node of nodes){
        if ((0, _types.isMfmHashtag)(node) && (0, _utils.isHashtag)(node.props.hashtag)) hashtags.add(node.props.hashtag);
    }
    return [
        ...hashtags
    ];
}

//# sourceMappingURL=extract-hashtags.js.map
