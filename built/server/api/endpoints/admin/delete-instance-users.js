"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _define = require("../../define");
const _user = require("../../../../models/user");
const _messagingmessage = require("../../../../models/messaging-message");
const _suspenduser = require("../../../../services/suspend-user");
const _queue = require("../../../../queue");
const _converthost = require("../../../../misc/convert-host");
const _instance = require("../../../../models/instance");
const meta = {
    desc: {
        'ja-JP': '',
        'en-US': ''
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        host: {
            validator: _cafy.default.str.min(1),
            desc: {
                'ja-JP': 'Host',
                'en-US': 'Host'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const host = (0, _converthost.toDbHost)(ps.host);
    const instance = await _instance.default.findOne({
        host
    });
    if (instance == null) throw 'instance not found';
    if (!instance.isBlocked && !instance.isMarkedAsClosed) throw 'instance はブロックでもクローズでもない';
    const users = await _user.default.find({
        host,
        isDeleted: {
            $ne: true
        }
    });
    for (const user of users){
        console.log(`delete user: ${user.username}@${user.host}`);
        await _user.default.update({
            _id: user._id
        }, {
            $set: {
                isDeleted: true,
                name: null,
                description: null,
                pinnedNoteIds: [],
                password: null,
                email: null,
                twitter: null,
                github: null,
                discord: null,
                profile: {},
                fields: [],
                clientSettings: {}
            }
        });
        await _messagingmessage.default.remove({
            userId: user._id
        });
        await (0, _queue.createDeleteNotesJob)(user);
        await (0, _queue.createDeleteDriveFilesJob)(user);
        await (0, _suspenduser.doPostSuspend)(user, true);
    }
});

//# sourceMappingURL=delete-instance-users.js.map
