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
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _user = require("./user");
const NoteReaction = _mongodb1.default.get('noteReactions');
NoteReaction.createIndex([
    'noteId',
    'userId'
], {
    unique: true
});
NoteReaction.dropIndex('noteId').catch(()=>{});
NoteReaction.createIndex('userId');
NoteReaction.dropIndex([
    'userId',
    'noteId'
], {
    unique: true
}).catch(()=>{});
const _default = NoteReaction;
const pack = async (reaction, me)=>{
    let _reaction;
    // Populate the reaction if 'reaction' is ID
    if ((0, _isobjectid.default)(reaction)) {
        _reaction = await NoteReaction.findOne({
            _id: reaction
        });
    } else if (typeof reaction === 'string') {
        _reaction = await NoteReaction.findOne({
            _id: new _mongodb.ObjectID(reaction)
        });
    } else {
        _reaction = _deepcopy(reaction);
    }
    // Rename _id to id
    _reaction.id = _reaction._id;
    delete _reaction._id;
    // Populate user
    _reaction.user = await (0, _user.pack)(_reaction.userId, me);
    return _reaction;
};

//# sourceMappingURL=note-reaction.js.map
