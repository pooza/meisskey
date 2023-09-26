"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    emojiRegex: function() {
        return emojiRegex;
    },
    emojiRegexWithCustom: function() {
        return emojiRegexWithCustom;
    },
    vendorEmojiRegex: function() {
        return vendorEmojiRegex;
    }
});
const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;
const emojiRegex = new RegExp(`(${twemojiRegex.source})`);
const emojiRegexWithCustom = new RegExp(`(${emojiRegex.source}|:[0-9A-Za-z_]+:)`, 'g');
const vendorEmojiRegex = /(\uD83D\uDC31\u200D(?:\uD83D\uDC64|\uD83D\uDE80|\uD83D\uDC53|\uD83D\uDCBB|\uD83D\uDC09|\uD83C\uDFCD))/;

//# sourceMappingURL=emoji-regex.js.map
