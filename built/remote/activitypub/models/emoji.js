"use strict";
Object.defineProperty(exports, "resyncEmoji", {
    enumerable: true,
    get: function() {
        return resyncEmoji;
    }
});
const _emoji = require("../../../models/emoji");
const _resolver = require("../resolver");
const _type = require("../type");
const _array = require("../../../prelude/array");
const _emojistore = require("../../../services/emoji-store");
async function resyncEmoji(emoji, force = false) {
    // skip local
    if (!emoji.uri) return;
    // resolve to AP Emoji
    const resolver = new _resolver.default();
    const apEmoji = await resolver.resolve(emoji.uri);
    if (!(0, _type.isEmoji)(apEmoji)) throw new Error(`Object type is not an Emoji`);
    apEmoji.icon = (0, _array.toSingle)(apEmoji.icon);
    if (force || emoji.url !== apEmoji.icon.url) {
        console.log(`update emoji url ${emoji.uri} ${emoji.url} => ${apEmoji.icon.url}`);
        const updated = await _emoji.default.findOneAndUpdate({
            _id: emoji._id
        }, {
            $set: {
                url: apEmoji.icon.url,
                //uri: apEmoji.id,
                saved: false,
                updatedAt: new Date()
            }
        });
        await (0, _emojistore.tryStockEmoji)(updated);
    }
}

//# sourceMappingURL=emoji.js.map
