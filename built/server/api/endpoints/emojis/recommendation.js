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
const _define = require("../../define");
const _emoji = require("../../../../models/emoji");
const _converthost = require("../../../../misc/convert-host");
const meta = {
    tags: [
        'emojis'
    ],
    requireCredential: false,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 1000),
            default: 500
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        minInstances: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'XEmoji'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const xs = await _emoji.default.aggregate([
        {
            $match: {
                host: {
                    $ne: null
                },
                md5: {
                    $ne: null
                },
                updatedAt: {
                    $gt: new Date('2000-01-01')
                }
            }
        },
        {
            // 1インスタンス内で重複登録しているとこがあるので除外
            $group: {
                _id: {
                    md5: '$md5',
                    host: '$host'
                }
            }
        },
        {
            // 使用インスタンス数カウント
            $group: {
                _id: '$_id.md5',
                count: {
                    $sum: 1
                }
            }
        },
        {
            // あまり採用インスタンスが少ないのは変なのあるので除外
            $match: {
                count: {
                    $gt: ps.minInstances
                }
            }
        },
        {
            // 使用インスタンスが多い順でソート
            $sort: {
                count: -1
            }
        },
        {
            $skip: ps.offset
        },
        {
            $limit: ps.limit
        },
        {
            // join source emojis
            $lookup: {
                from: 'emoji',
                localField: '_id',
                foreignField: 'md5',
                as: 'emojis'
            }
        }
    ]);
    const toTime = (date)=>date ? date.getTime() : 0;
    const toEmoji = async (res)=>{
        // updatedAtが一番新しいインスタンスの絵文字ということにする
        const emoji = res.emojis.sort((a, b)=>toTime(b.updatedAt) - toTime(a.updatedAt))[0];
        const xemoji = await (0, _emoji.packXEmoji)(emoji);
        xemoji.sources = res.emojis.map((emoji)=>{
            return {
                name: emoji.name,
                host: (0, _converthost.toApHost)(emoji.host)
            };
        });
        return xemoji;
    };
    const xemojis = await Promise.all(xs.map((x)=>toEmoji(x)));
    return xemojis.sort((a, b)=>a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
});

//# sourceMappingURL=recommendation.js.map
