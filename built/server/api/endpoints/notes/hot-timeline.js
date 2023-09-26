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
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'hotタイムラインを取得します。'
    },
    tags: [
        'notes'
    ],
    params: {},
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    },
    errors: {}
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    return [];
});

//# sourceMappingURL=hot-timeline.js.map
