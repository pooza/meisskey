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
const Blocking = _mongodb1.default.get('blocking');
Blocking.createIndex('blockerId');
Blocking.createIndex('blockeeId');
Blocking.createIndex([
    'blockerId',
    'blockeeId'
], {
    unique: true
});
const _default = Blocking;
const packMany = (blockings, me)=>{
    return Promise.all(blockings.map((x)=>pack(x, me)));
};
const pack = async (blocking, me)=>{
    let _blocking;
    // Populate the blocking if 'blocking' is ID
    if ((0, _isobjectid.default)(blocking)) {
        _blocking = await Blocking.findOne({
            _id: blocking
        });
    } else if (typeof blocking === 'string') {
        _blocking = await Blocking.findOne({
            _id: new _mongodb.ObjectID(blocking)
        });
    } else {
        _blocking = _deepcopy(blocking);
    }
    // Rename _id to id
    _blocking.id = _blocking._id;
    delete _blocking._id;
    // Populate blockee
    _blocking.blockee = await (0, _user.pack)(_blocking.blockeeId, me, {
        detail: true
    });
    if (_blocking.blockee == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: blocking -> blockee :: ${_blocking.blockeeId}`);
        _blocking.blockee = {
        };
    }
    return _blocking;
};

//# sourceMappingURL=blocking.js.map
