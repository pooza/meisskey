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
const _cafyid = require("../../../../../misc/cafy-id");
const meta = {
    desc: {
        'ja-JP': 'カスタム絵文字を削除します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        id: {
            validator: _cafy.default.type(_cafyid.default)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const emoji = await _emoji.default.findOne({
        _id: ps.id
    });
    if (emoji == null) throw new Error('emoji not found');
    await _emoji.default.remove({
        _id: emoji._id
    });
    return;
});

//# sourceMappingURL=remove.js.map
