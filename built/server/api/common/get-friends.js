"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getFriendIds: function() {
        return getFriendIds;
    },
    getFriends: function() {
        return getFriends;
    }
});
const _following = require("../../../models/following");
const _user = require("../../../models/user");
const getFriendIds = async (me, includeMe = true, activeDays = -1)=>{
    // Fetch relation to other users who the I follows
    // SELECT followee
    const followings = await _following.default.find({
        followerId: me
    }, {
        fields: {
            followeeId: true
        }
    });
    // ID list of other users who the I follows
    let myfollowingIds = followings.map((following)=>following.followeeId);
    if (activeDays > 0) {
        const us = await _user.default.find({
            _id: {
                $in: myfollowingIds
            },
            updatedAt: {
                $gt: new Date(Date.now() - activeDays * 1000 * 86400)
            }
        }, {
            fields: {
                _id: true
            }
        });
        myfollowingIds = us.map((u)=>u._id);
    }
    if (includeMe) {
        myfollowingIds.push(me);
    }
    return myfollowingIds;
};
const getFriends = async (me, includeMe = true, remoteOnly = false)=>{
    const q = remoteOnly ? {
        followerId: me,
        '_followee.host': {
            $ne: null
        }
    } : {
        followerId: me
    };
    // Fetch relation to other users who the I follows
    const followings = await _following.default.find(q);
    // ID list of other users who the I follows
    const myfollowings = followings.map((following)=>({
            id: following.followeeId
        }));
    if (includeMe) {
        myfollowings.push({
            id: me
        });
    }
    return myfollowings;
};

//# sourceMappingURL=get-friends.js.map
