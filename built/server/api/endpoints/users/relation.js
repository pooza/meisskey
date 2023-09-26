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
const _user = require("../../../../models/user");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'ユーザー間のリレーションを取得します。'
    },
    tags: [
        'users'
    ],
    requireCredential: true,
    params: {
        userId: {
            validator: _cafy.default.either(_cafy.default.type(_cafyid.default), _cafy.default.arr(_cafy.default.type(_cafyid.default)).unique()),
            transform: (v)=>Array.isArray(v) ? v.map((x)=>(0, _cafyid.transform)(x)) : (0, _cafyid.transform)(v),
            desc: {
                'ja-JP': 'ユーザーID (配列でも可)'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const ids = Array.isArray(ps.userId) ? ps.userId : [
        ps.userId
    ];
    const relations = await Promise.all(ids.map((id)=>(0, _user.getRelation)(me._id, id)));
    return Array.isArray(ps.userId) ? relations : relations[0];
});

//# sourceMappingURL=relation.js.map
