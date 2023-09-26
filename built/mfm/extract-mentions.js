"use strict";
Object.defineProperty(exports, "extractMentions", {
    enumerable: true,
    get: function() {
        return extractMentions;
    }
});
const _types = require("../mfm/types");
function extractMentions(nodes) {
    const mentions = new Set();
    for (const node of nodes){
        if ((0, _types.isMfmMention)(node)) mentions.add(node);
    }
    return [
        ...mentions
    ].map((x)=>x.props);
}

//# sourceMappingURL=extract-mentions.js.map
