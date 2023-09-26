"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getHideRenoteUserIds: function() {
        return getHideRenoteUserIds;
    },
    getHideRenoteUserIdsById: function() {
        return getHideRenoteUserIdsById;
    }
});
const _userfilter = require("../../../models/user-filter");
async function getHideRenoteUserIds(me) {
    var _me;
    return await getHideRenoteUserIdsById((_me = me) === null || _me === void 0 ? void 0 : _me._id);
}
async function getHideRenoteUserIdsById(ownerId) {
    if (!ownerId) return [];
    const filters = await _userfilter.default.find({
        ownerId,
        hideRenote: true
    });
    return filters.map((x)=>x.targetId);
}

//# sourceMappingURL=get-hide-renote-users.js.map
