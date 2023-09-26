// なぜか残っている削除ユーザーのオブジェクトを物理削除する
"use strict";
const _user = require("../models/user");
const _notification = require("../models/notification");
const _followrequest = require("../models/follow-request");
const _following = require("../models/following");
const _notereaction = require("../models/note-reaction");
const _userlist = require("../models/user-list");
async function main() {
    const users = await _user.default.find({
        $or: [
            {
                isDeleted: true
            },
            {
                isSuspended: true
            }
        ]
    }, {
        fields: {
            _id: true
        }
    });
    let prs = 0;
    for (const u of users){
        prs++;
        const user = await _user.default.findOne({
            _id: u._id
        });
        console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);
        const receivedNotification = await _notification.default.remove({
            notifieeId: user._id
        });
        console.log(`  receivedNotification:${receivedNotification.deletedCount}`);
        const sendNotification = await _notification.default.remove({
            notifierId: user._id
        });
        console.log(`  sendNotification:${sendNotification.deletedCount}`);
        const receivedFollowRequest = await _followrequest.default.remove({
            followeeId: user._id
        });
        console.log(`  receivedFollowRequest:${receivedFollowRequest.deletedCount}`);
        const sendFollowRequest = await _followrequest.default.remove({
            followerId: user._id
        });
        console.log(`  sendFollowRequest:${sendFollowRequest.deletedCount}`);
        const followed = await _following.default.remove({
            followeeId: user._id
        });
        console.log(`  follows:${followed.deletedCount}`);
        const follows = await _following.default.remove({
            followerId: user._id
        });
        console.log(`  follows:${follows.deletedCount}`);
        const reactions = await _notereaction.default.remove({
            userId: user._id
        });
        console.log(`  reactions:${reactions.deletedCount}`);
        const listed = await _userlist.default.update({
            userIds: user._id
        }, {
            $pull: {
                userIds: user._id
            }
        });
        console.log(`  listed:${listed.nModified}`);
    }
}
main().then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-deleted-user-objs.js.map
