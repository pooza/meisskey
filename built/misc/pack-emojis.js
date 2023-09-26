"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    packEmojis: function() {
        return packEmojis;
    },
    packAvatarEmoji: function() {
        return packAvatarEmoji;
    },
    packAvatarEmojis: function() {
        return packAvatarEmojis;
    },
    packCustomEmoji: function() {
        return packCustomEmoji;
    },
    packCustomEmojis: function() {
        return packCustomEmojis;
    },
    getEmojiUrl: function() {
        return getEmojiUrl;
    }
});
const _user = require("../models/user");
const _emoji = require("../models/emoji");
const _ = require("punycode/");
const _config = require("../config");
const _converthost = require("./convert-host");
const _getdrivefileurl = require("./get-drive-file-url");
const _drivefile = require("../models/drive-file");
const _url = require("../prelude/url");
const _sanitizeurl = require("./sanitize-url");
const SELF_HOST = null;
async function packEmojis(emojis, ownerHost) {
    const [custom, avatar] = await Promise.all([
        packCustomEmojis(emojis, ownerHost),
        packAvatarEmojis(emojis, ownerHost)
    ]);
    return custom.concat(avatar);
}
async function packAvatarEmoji(str, ownerHost) {
    // str: '@a' => { username: 'a', host: ownerHost } のアバター
    // str: '@a@b' => { username: 'a', host: 'b } のアバター
    const match = str.match(/^@([\w-]+)(?:@([\w.-]+))?$/);
    if (!match) return null;
    let queryHost = match[2] || ownerHost || SELF_HOST;
    if ((0, _converthost.isSelfHost)(queryHost)) queryHost = SELF_HOST;
    const usernameLower = match[1].toLowerCase();
    const host = normalizeHost(queryHost); // DB (Unicode) host
    const resolvable = `@${match[1]}` + (queryHost ? `@${normalizeAsciiHost(queryHost)}` : '');
    const user = await _user.default.findOne({
        usernameLower,
        host
    });
    return {
        name: str,
        url: (0, _sanitizeurl.sanitizeUrl)(user && user.avatarId ? (0, _getdrivefileurl.default)(await _drivefile.default.findOne({
            _id: user.avatarId
        }), true) : `${_config.default.driveUrl}/default-avatar.jpg`),
        host,
        resolvable
    };
}
async function packAvatarEmojis(strs, ownerHost) {
    const emojis = await Promise.all(strs.map((str)=>packAvatarEmoji(str, ownerHost)));
    return emojis.filter((x)=>x != null);
}
async function packCustomEmoji(str, ownerHost) {
    // str: 'a' => Emoji { name: 'a', host: ownerHost }
    // str: 'a@.' => Emoji { name: 'a', host: null }	(リアクションのホスト省略系は必ずこの形式で来る)
    // str: '@a@b' => Emoji { username: 'a', host: 'b' }
    const match = str.match(/^(\w+)(?:@([\w.-]+))?$/);
    if (!match) return null;
    // クエリに使うホスト
    const queryHost = match[2] === '.' ? SELF_HOST : match[2] === undefined ? ownerHost : (0, _converthost.isSelfHost)(match[2]) ? SELF_HOST : match[2] || ownerHost;
    const name = match[1];
    const host = normalizeHost(queryHost);
    const resolvable = `${match[1]}` + (queryHost ? `@${normalizeAsciiHost(queryHost)}` : '');
    const emoji = await _emoji.default.findOne({
        name,
        host
    }, {
        fields: {
            _id: false
        }
    });
    if (emoji == null) return null;
    const e = {
        name: str,
        url: (0, _sanitizeurl.sanitizeUrl)(getEmojiUrl(emoji)),
        host: host,
        resolvable: resolvable
    };
    if (emoji.direction) {
        e.direction = emoji.direction;
    }
    return e;
}
async function packCustomEmojis(names, ownerHost) {
    const emojis = await Promise.all(names.map((name)=>packCustomEmoji(name, ownerHost)));
    return emojis.filter((x)=>x != null);
}
const normalizeHost = (host)=>{
    if (host == null) return null;
    return (0, _.toUnicode)(host.toLowerCase());
};
const normalizeAsciiHost = (host)=>{
    if (host == null) return null;
    return (0, _.toASCII)(host.toLowerCase());
};
function getEmojiUrl(emoji) {
    return emoji.host && !emoji.saved ? `${_config.default.url}/proxy/image.png?${(0, _url.query)({
        url: emoji.url
    })}` : emoji.url;
}

//# sourceMappingURL=pack-emojis.js.map
