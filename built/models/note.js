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
    isValidCw: function() {
        return isValidCw;
    },
    hideNote: function() {
        return hideNote;
    },
    packMany: function() {
        return packMany;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _stringz = require("stringz");
const _user = require("./user");
const _pollvote = require("./poll-vote");
const _notereaction = require("./note-reaction");
const _drivefile = require("./drive-file");
const _following = require("./following");
const _packemojis = require("../misc/pack-emojis");
const _logger = require("../db/logger");
const _reactionlib = require("../misc/reaction-lib");
const _parse = require("../mfm/parse");
const _awaitall = require("../prelude/await-all");
const _app = require("./app");
const _packutils = require("../misc/pack-utils");
const _cafyid = require("../misc/cafy-id");
const _extractmfmtypes = require("../mfm/extract-mfm-types");
const _nyaize = require("../misc/nyaize");
const _extractemojis = require("../mfm/extract-emojis");
const _sanitizeurl = require("../misc/sanitize-url");
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
const Note = _mongodb1.default.get('notes');
Note.createIndex('uri', {
    sparse: true,
    unique: true
});
Note.createIndex('mentions');
Note.createIndex('visibleUserIds');
Note.createIndex('replyId');
Note.createIndex('renoteId');
Note.createIndex('tagsLower');
Note.createIndex('_files._id');
Note.createIndex('_files.contentType');
Note.createIndex({
    createdAt: -1
});
Note.createIndex({
    score: -1
}, {
    sparse: true
});
Note.createIndex({
    '_user.host': 1,
    _id: -1
});
Note.createIndex({
    '_user.host': 1,
    replyId: 1,
    _id: -1
});
Note.dropIndex('_user.host').catch(()=>{});
Note.createIndex('mecabWords');
Note.createIndex('trendWords');
Note.createIndex({
    'userId': 1,
    _id: -1
});
Note.dropIndex('userId').catch(()=>{});
const _default = Note;
function isValidCw(text) {
    return (0, _stringz.length)(text.trim()) <= 500;
}
const hideNote = async (packedNote, meId)=>{
    let hide = false;
    // visibility が private かつ投稿者のIDが自分のIDではなかったら非表示(後方互換性のため)
    if (packedNote.visibility == 'private' && (meId == null || !meId.equals(packedNote.userId))) {
        hide = true;
    }
    // visibility が specified かつ自分が指定されていなかったら非表示
    if (packedNote.visibility == 'specified') {
        if (meId == null) {
            hide = true;
        } else if (meId.equals(packedNote.userId)) {
            hide = false;
        } else {
            // 指定されているかどうか
            const specified = packedNote.visibleUserIds.some((id)=>meId.equals(id));
            if (specified) {
                hide = false;
            } else {
                hide = true;
            }
        }
    }
    // visibility が followers かつ自分が投稿者のフォロワーでなかったら非表示
    if (packedNote.visibility == 'followers') {
        if (meId == null) {
            hide = true;
        } else if (meId.equals(packedNote.userId)) {
            hide = false;
        } else if (packedNote.reply && meId.equals(packedNote.reply.userId)) {
            // 自分の投稿に対するリプライ
            hide = false;
        } else if (packedNote.mentions && packedNote.mentions.some((id)=>meId.equals(id))) {
            // 自分へのメンション
            hide = false;
        } else {
            // フォロワーかどうか
            const following = await _following.default.findOne({
                followeeId: (0, _cafyid.transform)(packedNote.userId),
                followerId: meId
            });
            if (following == null) {
                hide = true;
            } else {
                hide = false;
            }
        }
    }
    if (hide) {
        packedNote.fileIds = [];
        packedNote.files = [];
        packedNote.replyId = null;
        packedNote.reply = null;
        packedNote.appId = null;
        packedNote.visibleUserIds = [];
        packedNote.reactionCounts = {};
        packedNote.renoteCount = 0;
        packedNote.repliesCount = 0;
        packedNote.text = null;
        packedNote.poll = null;
        packedNote.cw = null;
        packedNote.tags = [];
        packedNote.isHidden = true;
    }
};
const packMany = async (notes, me, options)=>{
    const items = await Promise.all(notes.map((n)=>pack(n, me, options)));
    return options && options.removeError ? items.filter((x)=>x != null) : items;
};
const pack = async (src, me, options)=>{
    var _db_visibleUserIds, _db_mentions, _db_mentionedRemoteUsers, _db_referenceIds_reverse, _this, _packed_user;
    const opts = Object.assign({
        detail: true,
        skipHide: false
    }, options);
    // Me
    const meId = me ? (0, _isobjectid.default)(me) ? me : typeof me === 'string' ? new _mongodb.ObjectID(me) : me._id : null;
    let db;
    // Populate the note if 'note' is ID
    if ((0, _isobjectid.default)(src)) {
        db = await Note.findOne({
            _id: src
        });
    } else if (typeof src === 'string') {
        db = await Note.findOne({
            _id: new _mongodb.ObjectID(src)
        });
    } else {
        db = _deepcopy(src);
    }
    // (データベースの欠損などで)投稿がデータベース上に見つからなかったとき
    if (db == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: note :: ${src}`);
        return null;
    }
    const reactionCounts = db.reactionCounts ? (0, _reactionlib.decodeReactionCounts)(db.reactionCounts) : {};
    const populateEmojis = async ()=>{
        // _note._userを消す前か、_note.userを解決した後でないとホストがわからない
        if (db._user) {
            const host = db._user.host;
            const rs = Object.keys(reactionCounts).filter((x)=>x && x.startsWith(':')).map((x)=>(0, _reactionlib.decodeReaction)(x)).map((x)=>x.replace(/:/g, ''));
            return (0, _packemojis.packEmojis)(db.emojis.concat(rs), host).catch((e)=>{
                console.warn(e);
                return [];
            });
        } else {
            return [];
        }
    };
    const populatePoll = async ()=>{
        const poll = db.poll;
        if (poll.multiple) {
            const votes = await _pollvote.default.find({
                userId: meId,
                noteId: db._id
            });
            const myChoices = poll.choices.filter((x)=>votes.some((y)=>x.id == y.choice));
            for (const myChoice of myChoices){
                myChoice.isVoted = true;
            }
            return poll;
        } else {
            poll.multiple = false;
        }
        const vote = await _pollvote.default.findOne({
            userId: meId,
            noteId: db._id
        });
        if (vote) {
            const myChoice = poll.choices.filter((x)=>x.id == vote.choice)[0];
            myChoice.isVoted = true;
        }
        return poll;
    };
    const populateMyReaction = async ()=>{
        const reaction = await _notereaction.default.findOne({
            userId: meId,
            noteId: db._id,
            deletedAt: {
                $exists: false
            }
        });
        if (reaction) {
            return (0, _reactionlib.decodeReaction)(reaction.reaction);
        }
        return null;
    };
    const populateMyRenote = async ()=>{
        const renote = await Note.findOne({
            userId: meId,
            renoteId: db._id,
            text: null,
            poll: null,
            'fileIds.0': {
                $exists: false
            },
            deletedAt: {
                $exists: false
            }
        }, {
            _id: 1
        });
        return renote ? `${renote._id}` : null;
    };
    const nodes = db.text ? (0, _parse.parseFull)(db.text) : [];
    // 互換性のため。(古いMisskeyではNoteにemojisが無い)
    if (db.emojis == null && nodes) {
        db.emojis = (0, _extractemojis.extractEmojis)(nodes);
    }
    const packed = await (0, _awaitall.awaitAll)(_object_spread({
        id: (0, _packutils.toOidString)(db._id),
        createdAt: (0, _packutils.toISODateOrNull)(db.createdAt),
        deletedAt: (0, _packutils.toISODateOrNull)(db.deletedAt),
        updatedAt: (0, _packutils.toISODateOrNull)(db.updatedAt),
        expiresAt: (0, _packutils.toISODateOrNull)(db.expiresAt),
        text: db.text,
        cw: db.cw,
        userId: (0, _packutils.toOidString)(db.userId),
        user: (0, _user.pack)(db.__user || db.userId, meId),
        replyId: db.replyId ? `${db.replyId}` : null,
        renoteId: db.renoteId ? `${db.renoteId}` : null,
        viaMobile: !!db.viaMobile,
        visibility: db.visibility,
        tags: db.tags.length > 0 ? db.tags : [],
        localOnly: !!db.localOnly,
        copyOnce: !!db.copyOnce,
        score: db.score || 0,
        renoteCount: db.renoteCount || 0,
        quoteCount: db.quoteCount || 0,
        repliesCount: db.repliesCount || 0,
        reactions: reactionCounts,
        reactionCounts: reactionCounts,
        emojis: populateEmojis(),
        fileIds: db.fileIds ? db.fileIds.map(_packutils.toOidString) : [],
        files: (0, _drivefile.packMany)(db.fileIds || []),
        uri: (0, _sanitizeurl.sanitizeUrl)(db.uri || null),
        url: (0, _sanitizeurl.sanitizeUrl)(db.url || null),
        appId: (0, _packutils.toOidStringOrNull)(db.appId),
        app: db.appId ? (0, _app.pack)(db.appId) : null,
        visibleUserIds: ((_db_visibleUserIds = db.visibleUserIds) === null || _db_visibleUserIds === void 0 ? void 0 : _db_visibleUserIds.length) > 0 ? db.visibleUserIds.map(_packutils.toOidString) : [],
        mentions: ((_db_mentions = db.mentions) === null || _db_mentions === void 0 ? void 0 : _db_mentions.length) > 0 ? db.mentions.map(_packutils.toOidString) : [],
        hasRemoteMentions: ((_db_mentionedRemoteUsers = db.mentionedRemoteUsers) === null || _db_mentionedRemoteUsers === void 0 ? void 0 : _db_mentionedRemoteUsers.length) > 0
    }, opts.detail ? _object_spread({
        reply: opts.detail && db.replyId ? pack(db.replyId, meId, {
            detail: false
        }) : null,
        renote: db.renoteId ? pack(db.renoteId, meId, {
            detail: true
        }) : null,
        referenceIds: (_this = db.referenceIds) === null || _this === void 0 ? void 0 : (_db_referenceIds_reverse = _this.reverse) === null || _db_referenceIds_reverse === void 0 ? void 0 : _db_referenceIds_reverse.call(_this),
        references: db.referenceIds ? packMany(db.referenceIds.reverse(), meId, {
            detail: false,
            removeError: true
        }) : null,
        poll: db.poll ? populatePoll() : null
    }, meId ? {
        myReaction: populateMyReaction(),
        myRenoteId: populateMyRenote()
    } : {}) : {}));
    if (nodes) {
        const mfmTypes = (0, _extractmfmtypes.extractMfmTypes)(nodes);
        const decorationMfmTypes = mfmTypes.filter((x)=>![
                'text',
                'mention',
                'hashtag',
                'url',
                'link',
                'emoji',
                'blockCode',
                'inlineCode'
            ].includes(x)) || [];
        packed.notHaveDecorationMfm = decorationMfmTypes.length === 0;
    }
    if ((_packed_user = packed.user) === null || _packed_user === void 0 ? void 0 : _packed_user.isCat) {
        var _packed_poll;
        if (packed.text) packed.text = (0, _nyaize.nyaize)(packed.text);
        if (packed.cw) packed.cw = (0, _nyaize.nyaize)(packed.cw);
        if ((_packed_poll = packed.poll) === null || _packed_poll === void 0 ? void 0 : _packed_poll.choices) {
            for (const c of packed.poll.choices){
                if (c.text) c.text = (0, _nyaize.nyaize)(c.text);
            }
        }
    }
    if (!opts.skipHide) {
        await hideNote(packed, meId);
    }
    //#region (データベースの欠損などで)参照しているデータがデータベース上に見つからなかったとき
    if (packed.user == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: note -> user :: ${packed.id} (user ${packed.userId})`);
        return null;
    }
    if (opts.detail) {
        if (packed.replyId != null && packed.reply == null) {
            packed.replyId = null;
        }
        if (packed.renoteId != null && packed.renote == null) {
            packed.renoteId = null;
        }
    }
    //#endregion
    return packed;
};

//# sourceMappingURL=note.js.map
