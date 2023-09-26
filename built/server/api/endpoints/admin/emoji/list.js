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
const _emoji = require("../../../../../models/emoji");
const _define = require("../../../define");
const _lodash = require("lodash");
const _packemojis = require("../../../../../misc/pack-emojis");
const meta = {
    desc: {
        'ja-JP': 'カスタム絵文字を取得します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        remote: {
            validator: _cafy.default.optional.bool
        },
        newer: {
            validator: _cafy.default.optional.bool
        },
        name: {
            validator: _cafy.default.optional.str
        },
        category: {
            validator: _cafy.default.optional.str
        },
        host: {
            validator: _cafy.default.optional.nullable.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const query = {
        host: ps.remote ? {
            $ne: null
        } : null
    };
    if (ps.name) {
        query.name = new RegExp((0, _lodash.escapeRegExp)(ps.name.toLowerCase()));
    }
    if (ps.host !== undefined) {
        query.host = ps.host;
    }
    if (ps.category) {
        query.category = ps.category;
    }
    if (ps.newer) {
        const ex1 = await _emoji.default.find({
            host: null,
            md5: {
                $ne: null
            }
        });
        const ex2 = ex1.map((x)=>x.md5);
        query.md5 = {
            $nin: ex2
        };
    }
    const emojis = await _emoji.default.find(query, {
        sort: {
            _id: -1
        },
        skip: ps.offset,
        limit: ps.limit
    });
    return emojis.map((e)=>({
            id: e._id,
            name: e.name,
            category: e.category,
            aliases: e.aliases,
            host: e.host,
            url: (0, _packemojis.getEmojiUrl)(e),
            type: e.type,
            md5: e.md5,
            direction: e.direction
        }));
});

//# sourceMappingURL=list.js.map
