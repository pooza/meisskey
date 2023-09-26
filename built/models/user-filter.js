"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packUserFilterMany: function() {
        return packUserFilterMany;
    },
    packUserFilter: function() {
        return packUserFilter;
    }
});
const _mongodb = require("mongodb");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _deepcopy = require("deepcopy");
const _user = require("./user");
const _rap = require("@prezzemolo/rap");
const UserFilter = _mongodb1.default.get('src');
//UserFilter.createIndex('ownerId');
//UserFilter.createIndex('targetId');
UserFilter.createIndex([
    'ownerId',
    'targetId'
], {
    unique: true
});
const _default = UserFilter;
const packUserFilterMany = (filters, me)=>{
    return Promise.all(filters.map((x)=>packUserFilter(x, me)));
};
const packUserFilter = async (src, me)=>{
    let populated;
    // Populate the src if 'src' is ID
    if ((0, _isobjectid.default)(src)) {
        populated = await UserFilter.findOne({
            _id: src
        });
    } else if (typeof src === 'string') {
        populated = await UserFilter.findOne({
            _id: new _mongodb.ObjectID(src)
        });
    } else {
        populated = _deepcopy(src);
    }
    const result = {
        id: populated._id,
        //createdAt: populated.createdAt.toISOString(),
        //ownerId: populated.ownerId,
        //owner: packUser(populated.ownerId),
        targetId: populated.targetId,
        target: (0, _user.pack)(populated.targetId),
        hideRenote: !!populated.hideRenote
    };
    return await (0, _rap.default)(result);
};

//# sourceMappingURL=user-filter.js.map
