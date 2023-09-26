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
const _define = require("../../../define");
const _perusernotes = require("../../../../../services/chart/per-user-notes");
const _cafyid = require("../../../../../misc/cafy-id");
const _chart = require("../../../../../services/chart");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': 'ユーザーごとの投稿のチャートを取得します。'
    },
    tags: [
        'charts',
        'users',
        'notes'
    ],
    allowGet: true,
    cacheSec: 600,
    canDenyPost: true,
    params: {
        span: {
            validator: _cafy.default.str.or([
                'day',
                'hour'
            ]),
            desc: {
                'ja-JP': '集計のスパン (day または hour)'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 500),
            default: 30,
            desc: {
                'ja-JP': '最大数。例えば 30 を指定したとすると、スパンが"day"の場合は30日分のデータが、スパンが"hour"の場合は30時間分のデータが返ります。'
            }
        },
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        }
    },
    res: (0, _chart.convertLog)(_perusernotes.perUserNotesLogSchema)
};
const _default = (0, _define.default)(meta, async (ps)=>{
    return await _perusernotes.default.getChart(ps.span, ps.limit, ps.userId);
});

//# sourceMappingURL=notes.js.map
