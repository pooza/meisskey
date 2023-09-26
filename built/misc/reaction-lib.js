"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    toDbReaction: function() {
        return toDbReaction;
    },
    toDbReactionNoResolve: function() {
        return toDbReactionNoResolve;
    },
    decodeReaction: function() {
        return decodeReaction;
    },
    decodeReactionCounts: function() {
        return decodeReactionCounts;
    }
});
const _emoji = require("../models/emoji");
const _emojiregex = require("./emoji-regex");
const _converthost = require("./convert-host");
const basic10 = {
    '👍': 'like',
    '❤': 'love',
    '😆': 'laugh',
    '🤔': 'hmm',
    '😮': 'surprise',
    '🎉': 'congrats',
    '💢': 'angry',
    '😥': 'confused',
    '😇': 'rip',
    '🍮': 'pudding'
};
const normalizeMap = {
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
const REACTION_STAR = '⭐';
async function toDbReaction(reaction, enableEmoji = true, reacterHost) {
    if (reaction == null) return REACTION_STAR;
    // 既存の文字列リアクションはそのまま
    if (Object.values(basic10).includes(reaction)) return reaction;
    if (!enableEmoji) return REACTION_STAR;
    // Unicode絵文字
    const match = _emojiregex.vendorEmojiRegex.exec(reaction) || _emojiregex.emojiRegex.exec(reaction);
    if (match) {
        // 合字を含む1つの絵文字
        const unicode = match[0];
        // 異体字セレクタ除去後の絵文字
        const normalized = unicode.match('\u200d') ? unicode : unicode.replace(/\ufe0f/g, '');
        // Unicodeプリンは寿司化不能とするため文字列化しない
        if (normalized === '🍮') return normalized;
        // プリン以外の既存のリアクションは文字列化する
        if (basic10[normalized]) return basic10[normalized];
        // それ以外はUnicodeのまま
        return normalized;
    }
    const custom = reaction.match(/^:([\w+-]+)(?:@\.)?:$/);
    if (custom) {
        const emoji = await _emoji.default.findOne({
            host: reacterHost ? (0, _converthost.toDbHost)(reacterHost) : reacterHost,
            name: custom[1]
        });
        if (emoji) {
            let name = custom[1];
            // リモートカスタム絵文字でローカルに同じハッシュのがあったらそれでリアクションされたことにしちゃう
            if (reacterHost && emoji.md5) {
                const local = await _emoji.default.findOne({
                    md5: emoji.md5,
                    host: null
                });
                if (local) {
                    name = local.name;
                    reacterHost = null;
                }
            }
            // MongoDBのKeyに.が使えないので . => _ に変換する
            const encodedHost = reacterHost ? (0, _converthost.toApHost)(reacterHost).replace(/\./g, '_') : reacterHost;
            const encodedReaction = encodedHost ? `:${name}@${encodedHost}:` : `:${name}:`;
            return encodedReaction;
        }
    }
    return REACTION_STAR;
}
async function toDbReactionNoResolve(reaction) {
    // 既存の文字列リアクションはそのまま
    if (Object.values(basic10).includes(reaction)) return reaction;
    // Unicode絵文字
    const match = _emojiregex.vendorEmojiRegex.exec(reaction) || _emojiregex.emojiRegex.exec(reaction);
    if (match) {
        // 合字を含む1つの絵文字
        const unicode = match[0];
        // 異体字セレクタ除去後の絵文字
        const normalized = unicode.match('\u200d') ? unicode : unicode.replace(/\ufe0f/g, '');
        // Unicodeプリンは寿司化不能とするため文字列化しない
        if (normalized === '🍮') return normalized;
        // プリン以外の既存のリアクションは文字列化する
        if (basic10[normalized]) return basic10[normalized];
        // それ以外はUnicodeのまま
        return normalized;
    }
    reaction = reaction.replace(/@\.:$/, ':');
    const x2 = reaction.match(/^:(.*)@(.*):$/);
    if (x2) {
        const name = x2[1];
        // MongoDBのKeyに.が使えないので . => _ に変換する
        const encodedHost = x2[2].replace(/\./g, '_');
        const encodedReaction = `:${name}@${encodedHost}:`;
        return encodedReaction;
    }
    return reaction;
}
function decodeReaction(str) {
    const custom = str.match(/^:([\w+-]+)(?:@([\w.-]+))?:$/);
    if (custom) {
        var _custom_;
        const name = custom[1];
        const host = ((_custom_ = custom[2]) === null || _custom_ === void 0 ? void 0 : _custom_.replace(/_/g, '.')) || '.'; // ローカルは.
        return `:${name}@${host}:`;
    }
    return normalizeMap[str] || str;
}
function decodeReactionCounts(reactions) {
    const _reactions = {};
    if (reactions['🍮'] && reactions['pudding']) {
        reactions['🍮'] = reactions['🍮'] + reactions['pudding'];
    }
    for (const reaction of Object.keys(reactions)){
        if (reactions[reaction] <= 0) continue;
        _reactions[decodeReaction(reaction)] = reactions[reaction];
    }
    return _reactions;
}

//# sourceMappingURL=reaction-lib.js.map
