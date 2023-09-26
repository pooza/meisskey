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
const _hashtag = require("../../../../models/hashtag");
const _define = require("../../define");
const _escaperegexp = require("escape-regexp");
const meta = {
    desc: {
        'ja-JP': 'ハッシュタグを検索します。'
    },
    tags: [
        'hashtags'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 300,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10,
            desc: {
                'ja-JP': '最大数'
            }
        },
        query: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'クエリ'
            }
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0,
            desc: {
                'ja-JP': 'オフセット'
            }
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'string'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const hashtags = await _hashtag.default.find({
        tag: new RegExp('^' + _escaperegexp(ps.query.toLowerCase()))
    }, {
        sort: {
            count: -1
        },
        limit: ps.limit,
        skip: ps.offset
    });
    return hashtags.map((tag)=>tag.tag);
});

//# sourceMappingURL=search.js.map
