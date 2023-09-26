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
const _note = require("../../../../models/note");
const _define = require("../../define");
const _fetchmeta = require("../../../../misc/fetch-meta");
const meta = {
    tags: [
        'hashtags'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 600
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const instance = await (0, _fetchmeta.default)();
    const hidedTags = instance.hidedTags.map((t)=>t.toLowerCase());
    // 重い
    //const span = 1000 * 60 * 60 * 24 * 7; // 1週間
    const span = 1000 * 60 * 60 * 24; // 1日
    //#region 1. 指定期間の内に投稿されたハッシュタグ(とユーザーのペア)を集計
    const data = await _note.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gt: new Date(Date.now() - span)
                },
                tagsLower: {
                    $exists: true,
                    $ne: []
                }
            }
        },
        {
            $unwind: '$tagsLower'
        },
        {
            $group: {
                _id: {
                    tag: '$tagsLower',
                    userId: '$userId'
                }
            }
        }
    ]);
    //#endregion
    if (data.length == 0) {
        return [];
    }
    let tags = [];
    // カウント
    for (const x of data.map((x)=>x._id).filter((x)=>!hidedTags.includes(x.tag))){
        const i = tags.findIndex((tag)=>tag.name == x.tag);
        if (i != -1) {
            tags[i].count++;
        } else {
            tags.push({
                name: x.tag,
                count: 1
            });
        }
    }
    // タグを人気順に並べ替え
    tags.sort((a, b)=>b.count - a.count);
    tags = tags.slice(0, 30);
    return tags;
});

//# sourceMappingURL=hashtags.js.map
