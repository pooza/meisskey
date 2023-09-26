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
const _detecturlmime = require("../../../../../misc/detect-url-mime");
const meta = {
    desc: {
        'ja-JP': 'カスタム絵文字を更新します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        id: {
            validator: _cafy.default.type(_cafyid.default)
        },
        name: {
            validator: _cafy.default.str
        },
        category: {
            validator: _cafy.default.optional.str
        },
        url: {
            validator: _cafy.default.str
        },
        aliases: {
            validator: _cafy.default.arr(_cafy.default.str)
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
    const emoji = await _emoji.default.findOne({
        _id: ps.id
    });
    if (emoji == null) throw new Error('emoji not found');
    const { mime, md5 } = await (0, _detecturlmime.detectUrlMime)(ps.url);
    await _emoji.default.update({
        _id: emoji._id
    }, {
        $set: {
            updatedAt: new Date(),
            name: ps.name,
            category: ps.category,
            aliases: ps.aliases,
            url: ps.url,
            type: mime,
            md5,
            direction: ps.direction
        }
    });
    return;
});

//# sourceMappingURL=update.js.map
