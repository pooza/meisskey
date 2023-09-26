"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getNote: function() {
        return getNote;
    },
    getUser: function() {
        return getUser;
    },
    getRemoteUser: function() {
        return getRemoteUser;
    },
    getLocalUser: function() {
        return getLocalUser;
    }
});
const _note = require("../../../models/note");
const _user = require("../../../models/user");
const _identifiableerror = require("../../../misc/identifiable-error");
async function getNote(noteId, user, visibleOnly = false) {
    const note = await _note.default.findOne({
        _id: noteId,
        'fileIds.100': {
            $exists: false
        },
        deletedAt: {
            $exists: false
        }
    });
    if (note == null) {
        throw new _identifiableerror.IdentifiableError('9725d0ce-ba28-4dde-95a7-2cbb2c15de24', 'No such note.');
    }
    if (visibleOnly && note.visibility !== 'public' && note.visibility !== 'home') {
        if (!user) throw new _identifiableerror.IdentifiableError('9725d0ce-ba28-4dde-95a7-2cbb2c15de24', 'No such note.');
        const packed = await (0, _note.pack)(note, user);
        if (packed.isHidden) throw new _identifiableerror.IdentifiableError('9725d0ce-ba28-4dde-95a7-2cbb2c15de24', 'No such note.');
    }
    return note;
}
async function getUser(userId) {
    const user = await _user.default.findOne({
        _id: userId,
        $or: [
            {
                isDeleted: {
                    $exists: false
                }
            },
            {
                isDeleted: false
            }
        ]
    }, {
        fields: {
            data: false,
            profile: false,
            clientSettings: false
        }
    });
    if (user == null) {
        throw new _identifiableerror.IdentifiableError('15348ddd-432d-49c2-8a5a-8069753becff', 'No such user.');
    }
    return user;
}
async function getRemoteUser(userId) {
    const user = await getUser(userId);
    if (!(0, _user.isRemoteUser)(user)) {
        throw 'user is not a remote user';
    }
    return user;
}
async function getLocalUser(userId) {
    const user = await getUser(userId);
    if (!(0, _user.isLocalUser)(user)) {
        throw 'user is not a local user';
    }
    return user;
}

//# sourceMappingURL=getters.js.map
