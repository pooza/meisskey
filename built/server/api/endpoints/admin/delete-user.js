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
const _cafyid = require("../../../../misc/cafy-id");
const _define = require("../../define");
const _user = require("../../../../models/user");
const _messagingmessage = require("../../../../models/messaging-message");
const _signin = require("../../../../models/signin");
const _suspenduser = require("../../../../services/suspend-user");
const _serverevent = require("../../../../services/server-event");
const _queue = require("../../../../queue");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーを削除します。',
        'en-US': 'delete user'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーID',
                'en-US': 'The user ID which you want to delete'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const user = await _user.default.findOne({
        _id: ps.userId
    });
    if (user == null) {
        throw new Error('user not found');
    }
    if (user.isAdmin) {
        throw new Error('cannot delete admin');
    }
    if (user.isModerator) {
        throw new Error('cannot delete moderator');
    }
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
    if ((0, _user.isLocalUser)(user)) {
        (0, _serverevent.publishTerminate)(user._id);
        _signin.default.remove({
            userId: user._id
        });
    }
    _messagingmessage.default.remove({
        userId: user._id
    });
    (0, _queue.createDeleteNotesJob)(user);
    (0, _queue.createDeleteDriveFilesJob)(user);
    (0, _suspenduser.doPostSuspend)(user, true);
});

//# sourceMappingURL=delete-user.js.map
