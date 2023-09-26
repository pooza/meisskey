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
const _queue = require("../../../../services/chart/queue");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': 'キューのチャートを取得します。'
    },
    tags: [
        'charts'
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
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'object'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    return await _queue.default.getChart(ps.span, ps.limit);
});

//# sourceMappingURL=queue.js.map
