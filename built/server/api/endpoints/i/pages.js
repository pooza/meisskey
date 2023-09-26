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
const _page = require("../../../../models/page");
const meta = {
    desc: {
        'ja-JP': '自分の作成したページ一覧を取得します。',
        'en-US': 'Get my pages.'
    },
    tags: [
        'account',
        'pages'
    ],
    requireCredential: true,
    kind: [
        'read:pages',
        'read:account',
        'account-read',
        'account/read'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const query = {
        userId: user._id
    };
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    const pages = await _page.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _page.packPageMany)(pages, user._id);
});

//# sourceMappingURL=pages.js.map
