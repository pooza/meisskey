"use strict";
Object.defineProperty(exports, "extractEmojis", {
    enumerable: true,
    get: function() {
        return extractEmojis;
    }
});
const _types = require("../mfm/types");
function extractEmojis(nodes) {
    const emojis = new Set();
    // parseBasicの場合、カスタム絵文字は最上位かlinkの直下にのみある。
    for (const node of nodes){
        if ((0, _types.isMfmCustomEmoji)(node)) {
            emojis.add(node.props.name);
        } else if ((0, _types.isMfmLink)(node)) {
            for (const child of node.children){
                if ((0, _types.isMfmCustomEmoji)(child)) emojis.add(child.props.name);
            }
        }
    }
    return [
        ...emojis
    ];
}

//# sourceMappingURL=extract-emojis.js.map
