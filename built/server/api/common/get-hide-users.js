"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getHideUserIds: function() {
        return getHideUserIds;
    },
    getHideUserIdsById: function() {
        return getHideUserIdsById;
    }
});
const _mute = require("../../../models/mute");
const _user = require("../../../models/user");
const _array = require("../../../prelude/array");
const _blocking = require("../../../models/blocking");
async function getHideUserIds(me, includeSilenced = true, includeSuspended = true) {
    return await getHideUserIdsById(me ? me._id : null, includeSilenced, includeSuspended);
}
async function getHideUserIdsById(meId, includeSilenced = true, includeSuspended = true) {
    const [deleted, suspended, silenced, muted, blocking, blocked] = await Promise.all([
        _user.default.find({
            isDeleted: true
        }, {
            fields: {
                _id: true
            }
        }),
        includeSuspended ? _user.default.find({
            isSuspended: true
        }, {
            fields: {
                _id: true
            }
        }) : [],
        includeSilenced ? _user.default.find({
            isSilenced: true,
            _id: {
                $nin: meId ? [
                    meId
                ] : []
            }
        }, {
            fields: {
                _id: true
            }
        }) : [],
        meId ? _mute.default.find({
            $or: [
                {
                    expiresAt: null
                },
                {
                    expiresAt: {
                        $gt: new Date()
                    }
                }
            ],
            muterId: meId
        }) : [],
        meId ? _blocking.default.find({
            blockerId: meId
        }) : [],
        meId ? _blocking.default.find({
            blockeeId: meId
        }) : []
    ]);
    return (0, _array.unique)(deleted.map((user)=>user._id).concat(suspended.map((user)=>user._id)).concat(silenced.map((user)=>user._id)).concat(muted.map((mute)=>mute.muteeId))).concat(blocking.map((block)=>block.blockeeId)).concat(blocked.map((block)=>block.blockerId));
}

//# sourceMappingURL=get-hide-users.js.map
