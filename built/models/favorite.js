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
const _note = require("./note");
const _logger = require("../db/logger");
const Favorite = _mongodb1.default.get('favorites');
Favorite.createIndex('userId');
Favorite.createIndex([
    'userId',
    'noteId'
], {
    unique: true
});
const _default = Favorite;
const packMany = (favorites, me)=>{
    return Promise.all(favorites.map((f)=>pack(f, me)));
};
const pack = async (favorite, me)=>{
    let _favorite;
    // Populate the favorite if 'favorite' is ID
    if ((0, _isobjectid.default)(favorite)) {
        _favorite = await Favorite.findOne({
            _id: favorite
        });
    } else if (typeof favorite === 'string') {
        _favorite = await Favorite.findOne({
            _id: new _mongodb.ObjectID(favorite)
        });
    } else {
        _favorite = _deepcopy(favorite);
    }
    // Rename _id to id
    _favorite.id = _favorite._id;
    delete _favorite._id;
    // Populate note
    _favorite.note = await (0, _note.pack)(_favorite.noteId, me, {
        detail: true
    });
    // (データベースの不具合などで)投稿が見つからなかったら
    if (_favorite.note == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: favorite -> note :: ${_favorite.id} (note ${_favorite.noteId})`);
        return null;
    }
    return _favorite;
};

//# sourceMappingURL=favorite.js.map
