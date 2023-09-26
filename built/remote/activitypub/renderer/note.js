"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return renderNote;
    },
    getEmojis: function() {
        return getEmojis;
    }
});
const _document = require("./document");
const _hashtag = require("./hashtag");
const _mention = require("./mention");
const _emoji = require("./emoji");
const _config = require("../../../config");
const _drivefile = require("../../../models/drive-file");
const _note = require("../../../models/note");
const _user = require("../../../models/user");
const _getnotehtml = require("../misc/get-note-html");
const _emoji1 = require("../../../models/emoji");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
async function renderNote(note, dive = true) {
    let inReplyTo;
    let inReplyToNote;
    if (note.replyId) {
        inReplyToNote = await _note.default.findOne({
            _id: note.replyId
        });
        if (inReplyToNote !== null) {
            const inReplyToUser = await _user.default.findOne({
                _id: inReplyToNote.userId
            });
            if (inReplyToUser !== null) {
                if (inReplyToNote.uri) {
                    inReplyTo = inReplyToNote.uri;
                } else {
                    if (dive) {
                        inReplyTo = await renderNote(inReplyToNote, false);
                    } else {
                        inReplyTo = `${_config.default.url}/notes/${inReplyToNote._id}`;
                    }
                }
            }
        }
    } else {
        inReplyTo = null;
    }
    let quote;
    if (note.renoteId) {
        const renote = await _note.default.findOne({
            _id: note.renoteId
        });
        if (renote) {
            quote = renote.uri ? renote.uri : `${_config.default.url}/notes/${renote._id}`;
        }
    }
    const user = await _user.default.findOne({
        _id: note.userId
    });
    const attributedTo = `${_config.default.url}/users/${user._id}`;
    const mentions = note.mentionedRemoteUsers && note.mentionedRemoteUsers.length > 0 ? note.mentionedRemoteUsers.map((x)=>x.uri) : [];
    let to = [];
    let cc = [];
    if (note.copyOnce) {
        to = [
            `${attributedTo}/followers`
        ];
        cc = mentions;
    } else if (note.visibility == 'public') {
        to = [
            'https://www.w3.org/ns/activitystreams#Public'
        ];
        cc = [
            `${attributedTo}/followers`
        ].concat(mentions);
    } else if (note.visibility == 'home') {
        to = [
            `${attributedTo}/followers`
        ];
        cc = [
            'https://www.w3.org/ns/activitystreams#Public'
        ].concat(mentions);
    } else if (note.visibility == 'followers') {
        to = [
            `${attributedTo}/followers`
        ];
        cc = mentions;
    } else {
        to = mentions;
    }
    const mentionedUsers = note.mentions ? await _user.default.find({
        _id: {
            $in: note.mentions
        }
    }) : [];
    const hashtagTags = (note.tags || []).map((tag)=>(0, _hashtag.default)(tag));
    const mentionTags = mentionedUsers.map((u)=>(0, _mention.default)(u));
    const files = (await Promise.all((note.fileIds || []).map((x)=>_drivefile.default.findOne(x)))).filter((x)=>x != null);
    const text = note.text;
    let apText = text;
    if (apText == null) apText = '';
    if (quote) {
        apText += `\n\nRE: ${quote}`;
    }
    const summary = note.cw === '' ? String.fromCharCode(0x200B) : note.cw;
    const content = (0, _getnotehtml.getNoteHtml)(Object.assign({}, note, {
        text: apText
    }));
    const emojis = await getEmojis(note.emojis);
    const apemojis = emojis.map((emoji)=>(0, _emoji.default)(emoji));
    const tag = [
        ...hashtagTags,
        ...mentionTags,
        ...apemojis
    ];
    const { choices = [], expiresAt = null, multiple = false } = note.poll || {};
    const asPoll = note.poll ? {
        type: 'Question',
        content: (0, _getnotehtml.getNoteHtml)(Object.assign({}, note, {
            text: text
        })),
        [expiresAt && expiresAt < new Date() ? 'closed' : 'endTime']: expiresAt,
        [multiple ? 'anyOf' : 'oneOf']: choices.map(({ text, votes })=>({
                type: 'Note',
                name: text,
                replies: {
                    type: 'Collection',
                    totalItems: votes
                }
            }))
    } : {};
    return _object_spread({
        id: `${_config.default.url}/notes/${note._id}`,
        url: `${_config.default.url}/notes/${note._id}`,
        type: 'Note',
        attributedTo,
        summary,
        content,
        _misskey_content: text,
        _misskey_quote: quote,
        quoteUri: quote,
        published: note.createdAt.toISOString(),
        to,
        cc,
        inReplyTo,
        attachment: files.map(_document.default),
        sensitive: note.cw != null || files.some((file)=>file.metadata.isSensitive),
        tag
    }, asPoll);
}
async function getEmojis(names) {
    if (names == null || names.length < 1) return [];
    const nameToEmoji = async (name)=>{
        if (name == null) return null;
        const m = name.match(/^(\w+)(?:@([\w.-]+))?$/);
        if (!m) return null;
        // TODO: リモートが対応していないのでリモート分は除外する
        if (m[2] != null) return null;
        const emoji = await _emoji1.default.findOne({
            name: m[1],
            host: m[2] || null
        });
        return emoji;
    };
    const emojis = await Promise.all(names.map((name)=>nameToEmoji(name)));
    return emojis.filter((emoji)=>emoji != null);
}

//# sourceMappingURL=note.js.map
