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
const _bcryptjs = require("bcryptjs");
const _user = require("../../../../models/user");
const _define = require("../../define");
const _queue = require("../../../../queue");
const _messagingmessage = require("../../../../models/messaging-message");
const _suspenduser = require("../../../../services/suspend-user");
const _serverevent = require("../../../../services/server-event");
const _error = require("../../error");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        password: {
            validator: _cafy.default.str
        }
    },
    errors: {
        incorrectPassword: {
            message: 'Incorrect password',
            code: 'INCORRECT_PASSWORD',
            id: 'c6c69c2d-1f58-4850-bb05-40db158b9de2'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Compare password
    const same = await _bcryptjs.compare(ps.password, user.password);
    if (!same) {
        throw new _error.ApiError(meta.errors.incorrectPassword);
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
    // Terminate streaming
    (0, _serverevent.publishTerminate)(user._id);
    _messagingmessage.default.remove({
        userId: user._id
    });
    (0, _queue.createDeleteSigninsJob)(user, 30 * 86400 * 1000);
    (0, _queue.createDeleteNotesJob)(user);
    (0, _queue.createDeleteDriveFilesJob)(user);
    (0, _suspenduser.doPostSuspend)(user, true);
    return;
});

//# sourceMappingURL=delete-account.js.map
