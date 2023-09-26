"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    },
    packMany: function() {
        return packMany;
    },
    pack: function() {
        return pack;
    }
});
const _cafy = require("cafy");
const _cafyid = require("../../../../misc/cafy-id");
const _define = require("../../define");
const _notereaction = require("../../../../models/note-reaction");
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _isobjectid = require("../../../../misc/is-objectid");
const _note = require("../../../../models/note");
const _logger = require("../../../../db/logger");
const meta = {
    desc: {
        'ja-JP': 'リアクションした投稿一覧を取得します。',
        'en-US': 'Get reacted notes'
    },
    tags: [
        'account',
        'notes',
        'reactions'
    ],
    requireCredential: true,
    kind: [
        'read:account',
        'account-read',
        'account/read'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const query = {
        userId: user._id
    };
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    // Get reactions
    const reactions = await _notereaction.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await packMany(reactions, user);
});
const packMany = (favorites, me)=>{
    return Promise.all(favorites.map((f)=>pack(f, me)));
};
const pack = async (reaction, me)=>{
    let _reaction;
    // Populate
    if ((0, _isobjectid.default)(reaction)) {
        _reaction = await _notereaction.default.findOne({
            _id: reaction
        });
    } else if (typeof reaction === 'string') {
        _reaction = await _notereaction.default.findOne({
            _id: new _mongodb.ObjectID(reaction)
        });
    } else {
        _reaction = _deepcopy(reaction);
    }
    // Rename _id to id
    _reaction.id = _reaction._id;
    delete _reaction._id;
    // Populate note
    _reaction.note = await (0, _note.pack)(_reaction.noteId, me, {
        detail: true
    });
    // (データベースの不具合などで)投稿が見つからなかったら
    if (_reaction.note == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: reaction -> note :: ${_reaction.id} (note ${_reaction.noteId})`);
        return null;
    }
    return _reaction;
};

//# sourceMappingURL=reactions.js.map
