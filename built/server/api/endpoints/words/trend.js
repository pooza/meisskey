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
const _array = require("../../../../prelude/array");
const _define = require("../../define");
/*
トレンドに載るためには「『直近a分間のユニーク投稿数が今からa分前～今からb分前の間のユニーク投稿数のn倍以上』のハッシュタグの上位5位以内に入る」ことが必要
ユニーク投稿数とはそのハッシュタグと投稿ユーザーのペアのカウントで、例えば同じユーザーが複数回同じハッシュタグを投稿してもそのハッシュタグのユニーク投稿数は1とカウントされる
*/ const rangeA = 1000 * 60 * 30;
const rangeB = 1000 * 60 * 120;
const coefficient = 1.25; // 「n倍」の部分
const requiredUsers = 3; // 最低何人がそのタグを投稿している必要があるか
const max = 5;
const meta = {
    tags: [
        'words'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 300
};
const _default = (0, _define.default)(meta, async ()=>{
    //#region 1. 直近Aの内に投稿されたハッシュタグ(とユーザーのペア)を集計
    const data = await _note.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gt: new Date(Date.now() - rangeA)
                },
                visibility: 'public',
                trendWords: {
                    $exists: true,
                    $ne: []
                }
            }
        },
        {
            $unwind: '$trendWords'
        },
        {
            $group: {
                _id: {
                    tag: '$trendWords',
                    userId: '$userId'
                }
            }
        }
    ]);
    //#endregion
    if (data.length == 0) {
        return [];
    }
    const tags = [];
    // カウント
    for (const x of data.map((x)=>x._id)){
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
    // 最低要求投稿者数を下回るならカットする
    const limitedTags = tags.filter((tag)=>tag.count >= requiredUsers);
    //#region 2. 1で取得したそれぞれのタグについて、「直近a分間のユニーク投稿数が今からa分前～今からb分前の間のユニーク投稿数のn倍以上」かどうかを判定する
    const hotsPromises = limitedTags.map(async (tag)=>{
        const passedCount = (await _note.default.distinct('userId', {
            trendWords: tag.name,
            visibility: 'public',
            createdAt: {
                $lt: new Date(Date.now() - rangeA),
                $gt: new Date(Date.now() - rangeB)
            }
        })).length;
        if (tag.count >= passedCount * coefficient) {
            return tag;
        } else {
            return null;
        }
    });
    //#endregion
    // タグを人気順に並べ替え
    let hots = (0, _array.erase)(null, await Promise.all(hotsPromises)).sort((a, b)=>b.count - a.count).map((tag)=>tag.name).slice(0, max);
    //#region 3. もし上記の方法でのトレンド抽出の結果、求められているタグ数に達しなければ「ただ単に現在投稿数が多いハッシュタグ」に切り替える
    if (hots.length < max) {
        hots = hots.concat(tags.filter((tag)=>hots.indexOf(tag.name) == -1).sort((a, b)=>b.count - a.count).map((tag)=>tag.name).slice(0, max - hots.length));
    }
    //#endregion
    //#region 2(または3)で話題と判定されたタグそれぞれについて過去の投稿数グラフを取得する
    const countPromises = [];
    const range = 20;
    // 10分
    const interval = 1000 * 60 * 10;
    for(let i = 0; i < range; i++){
        countPromises.push(Promise.all(hots.map((tag)=>_note.default.distinct('userId', {
                trendWords: tag,
                visibility: 'public',
                createdAt: {
                    $lt: new Date(Date.now() - interval * i),
                    $gt: new Date(Date.now() - interval * (i + 1))
                }
            }))));
    }
    const countsLog = await Promise.all(countPromises);
    const totalCounts = await Promise.all(hots.map((tag)=>_note.default.distinct('userId', {
            trendWords: tag,
            visibility: 'public',
            createdAt: {
                $gt: new Date(Date.now() - interval * range)
            }
        })));
    //#endregion
    const stats = hots.map((tag, i)=>({
            tag,
            chart: countsLog.map((counts)=>counts[i].length),
            usersCount: totalCounts[i].length
        }));
    return stats;
});

//# sourceMappingURL=trend.js.map
