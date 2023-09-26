"use strict";
Object.defineProperty(exports, "doPostUnsuspend", {
    enumerable: true,
    get: function() {
        return doPostUnsuspend;
    }
});
const _delete = require("../remote/activitypub/renderer/delete");
const _undo = require("../remote/activitypub/renderer/undo");
const _renderer = require("../remote/activitypub/renderer");
const _queue = require("../queue");
const _config = require("../config");
const _user = require("../models/user");
const _following = require("../models/following");
async function doPostUnsuspend(user) {
    if ((0, _user.isLocalUser)(user)) {
        // 知り得る全SharedInboxにUndo Delete配信
        const content = (0, _renderer.renderActivity)((0, _undo.default)((0, _delete.default)(`${_config.default.url}/users/${user._id}`, user), user));
        const queue = [];
        const followings = await _following.default.find({
            $or: [
                {
                    '_follower.sharedInbox': {
                        $ne: null
                    }
                },
                {
                    '_followee.sharedInbox': {
                        $ne: null
                    }
                }
            ]
        }, {
            '_follower.sharedInbox': 1,
            '_followee.sharedInbox': 1
        });
        const inboxes = followings.map((x)=>x._follower.sharedInbox || x._followee.sharedInbox);
        for (const inbox of inboxes){
            if (inbox != null && !queue.includes(inbox)) queue.push(inbox);
        }
        for (const inbox of queue){
            (0, _queue.deliver)(user, content, inbox);
        }
    }
}

//# sourceMappingURL=unsuspend-user.js.map
