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
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _deepcopy = require("deepcopy");
const _user = require("./user");
const _logger = require("../db/logger");
const Mute = _mongodb1.default.get('mute');
Mute.createIndex('muterId');
Mute.createIndex('muteeId');
Mute.createIndex([
    'muterId',
    'muteeId'
], {
    unique: true
});
const _default = Mute;
const packMany = (mutes, me)=>{
    return Promise.all(mutes.map((x)=>pack(x, me)));
};
const pack = async (mute, me)=>{
    let _mute;
    // Populate the mute if 'mute' is ID
    if ((0, _isobjectid.default)(mute)) {
        _mute = await Mute.findOne({
            _id: mute
        });
    } else if (typeof mute === 'string') {
        _mute = await Mute.findOne({
            _id: new _mongodb.ObjectID(mute)
        });
    } else {
        _mute = _deepcopy(mute);
    }
    // Rename _id to id
    _mute.id = _mute._id;
    delete _mute._id;
    // Populate mutee
    _mute.mutee = await (0, _user.pack)(_mute.muteeId, me, {
        detail: true
    });
    if (_mute.mutee == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: mute -> mutee :: ${_mute.muteeId}`);
        _mute.mutee = {
        };
    }
    return _mute;
};

//# sourceMappingURL=mute.js.map
