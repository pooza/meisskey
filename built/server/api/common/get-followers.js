"use strict";
Object.defineProperty(exports, "getFollowerIds", {
    enumerable: true,
    get: function() {
        return getFollowerIds;
    }
});
const _following = require("../../../models/following");
const getFollowerIds = async (me, includeMe = true)=>{
    const followings = await _following.default.find({
        followeeId: me
    }, {
        fields: {
            followerId: true
        }
    });
    const myfollowerIds = followings.map((following)=>following.followerId);
    if (includeMe) {
        myfollowerIds.push(me);
    }
    return myfollowerIds;
};

//# sourceMappingURL=get-followers.js.map
