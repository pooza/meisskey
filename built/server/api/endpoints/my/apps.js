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
const _app = require("../../../../models/app");
const _define = require("../../define");
const meta = {
    tags: [
        'account',
        'app'
    ],
    desc: {
        'ja-JP': '自分のアプリケーション一覧を取得します。',
        'en-US': 'Get my apps'
    },
    requireCredential: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const query = {
        userId: user._id
    };
    const apps = await _app.default.find(query, {
        limit: ps.limit,
        skip: ps.offset,
        sort: {
            _id: -1
        }
    });
    return await Promise.all(apps.map((app)=>(0, _app.pack)(app, user, {
            detail: true
        })));
});

//# sourceMappingURL=apps.js.map
