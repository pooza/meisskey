"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packXEmoji: function() {
        return packXEmoji;
    }
});
const _mongodb = require("mongodb");
const _mongodb1 = require("../db/mongodb");
const _deepcopy = require("deepcopy");
const _isobjectid = require("../misc/is-objectid");
const _converthost = require("../misc/convert-host");
const _packemojis = require("../misc/pack-emojis");
const _sanitizeurl = require("../misc/sanitize-url");
const Emoji = _mongodb1.default.get('emoji');
Emoji.createIndex('name');
Emoji.createIndex('host');
Emoji.createIndex('md5');
Emoji.createIndex([
    'name',
    'host'
], {
    unique: true
});
const _default = Emoji;
async function packXEmoji(emoji) {
    let _emoji;
    // Populate if ID
    if ((0, _isobjectid.default)(emoji)) {
        _emoji = await Emoji.findOne({
            _id: emoji
        });
    } else if (typeof emoji === 'string') {
        _emoji = await Emoji.findOne({
            _id: new _mongodb.ObjectID(emoji)
        });
    } else {
        _emoji = _deepcopy(emoji);
    }
    var _sanitizeUrl;
    // リモートは /files/ で Proxyさせる
    const url = (_sanitizeUrl = (0, _sanitizeurl.sanitizeUrl)((0, _packemojis.getEmojiUrl)(emoji))) !== null && _sanitizeUrl !== void 0 ? _sanitizeUrl : '';
    const name = _emoji.name + (_emoji.host ? `@${(0, _converthost.toApHost)(_emoji.host)}` : '');
    return {
        name,
        url,
        category: _emoji.category || null,
        aliases: _emoji.aliases || []
    };
}

//# sourceMappingURL=emoji.js.map
