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
const FollowRequest = _mongodb1.default.get('followRequests');
FollowRequest.createIndex('followerId');
FollowRequest.createIndex('followeeId');
FollowRequest.createIndex([
    'followerId',
    'followeeId'
], {
    unique: true
});
const _default = FollowRequest;
const pack = async (request, me)=>{
    let _request;
    // Populate the request if 'request' is ID
    if ((0, _isobjectid.default)(request)) {
        _request = await FollowRequest.findOne({
            _id: request
        });
    } else if (typeof request === 'string') {
        _request = await FollowRequest.findOne({
            _id: new _mongodb.ObjectID(request)
        });
    } else {
        _request = _deepcopy(request);
    }
    // Rename _id to id
    _request.id = _request._id;
    delete _request._id;
    // Populate follower
    _request.follower = await (0, _user.pack)(_request.followerId, me);
    // Populate followee
    _request.followee = await (0, _user.pack)(_request.followeeId, me);
    return _request;
};

//# sourceMappingURL=follow-request.js.map
