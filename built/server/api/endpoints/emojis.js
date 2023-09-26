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
const _define = require("../define");
const _emoji = require("../../../models/emoji");
const meta = {
    tags: [
        'emojis'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 60,
    params: {},
    res: {
        type: 'array',
        items: {
            type: 'XEmoji'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const emojis = await _emoji.default.find({
        host: null
    });
    return {
        emojis: await Promise.all(emojis.map((emoji)=>(0, _emoji.packXEmoji)(emoji)))
    };
});

//# sourceMappingURL=emojis.js.map
