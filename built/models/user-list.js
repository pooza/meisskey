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
const UserList = _mongodb1.default.get('userList');
const _default = UserList;
const pack = async (userList)=>{
    let _userList;
    if ((0, _isobjectid.default)(userList)) {
        _userList = await UserList.findOne({
            _id: userList
        });
    } else if (typeof userList === 'string') {
        _userList = await UserList.findOne({
            _id: new _mongodb.ObjectID(userList)
        });
    } else {
        _userList = _deepcopy(userList);
    }
    if (!_userList) throw `invalid userList arg ${userList}`;
    // Rename _id to id
    _userList.id = _userList._id;
    delete _userList._id;
    _userList.hosts = _userList.hosts || [];
    _userList.hideFromHome = !!_userList.hideFromHome;
    _userList.mediaOnly = !!_userList.mediaOnly;
    return _userList;
};

//# sourceMappingURL=user-list.js.map
