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
const _detecturlmime = require("../../../../../misc/detect-url-mime");
const meta = {
    desc: {
        'ja-JP': 'カスタム絵文字を追加します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        name: {
            validator: _cafy.default.str.min(1)
        },
        category: {
            validator: _cafy.default.optional.str
        },
        url: {
            validator: _cafy.default.str.min(1)
        },
        aliases: {
            validator: _cafy.default.optional.arr(_cafy.default.str.min(1)),
            default: []
        },
        direction: {
            validator: _cafy.default.optional.str.or([
                'left',
                'right'
            ])
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const { mime, md5 } = await (0, _detecturlmime.detectUrlMime)(ps.url);
    const emoji = await _emoji.default.insert({
        updatedAt: new Date(),
        name: ps.name,
        category: ps.category,
        host: null,
        aliases: ps.aliases,
        url: ps.url,
        type: mime,
        md5,
        direction: ps.direction
    });
    return {
        id: emoji._id
    };
});

//# sourceMappingURL=add.js.map
