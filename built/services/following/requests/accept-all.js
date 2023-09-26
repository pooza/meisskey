"use strict";
Object.defineProperty(exports, /**
 * 指定したユーザー宛てのフォローリクエストをすべて承認
 * @param user ユーザー
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../models/user");
const _followrequest = require("../../../models/follow-request");
const _accept = require("./accept");
async function _default(user) {
    const requests = await _followrequest.default.find({
        followeeId: user._id
    });
    for (const request of requests){
        const follower = await _user.default.findOne({
            _id: request.followerId
        });
        (0, _accept.default)(user, follower);
    }
    _user.default.update({
        _id: user._id
    }, {
        $set: {
            pendingReceivedFollowRequestsCount: 0
        }
    });
}

//# sourceMappingURL=accept-all.js.map
