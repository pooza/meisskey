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
const _error = require("../../../error");
const _emoji = require("../../../../../models/emoji");
const _cafyid = require("../../../../../misc/cafy-id");
const _emojistore = require("../../../../../services/emoji-store");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        emojiId: {
            validator: _cafy.default.type(_cafyid.default)
        }
    },
    errors: {
        noSuchEmoji: {
            message: 'No such emoji.',
            code: 'NO_SUCH_EMOJI',
            id: 'e2785b66-dca3-4087-9cac-b93c541cc425'
        },
        duplicatedName: {
            message: 'Duplicated name.',
            code: 'DUPLICATED_NAME',
            id: '3206c9df-e133-4f5b-bf1f-e51123efb39d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    let emoji = await _emoji.default.findOne(ps.emojiId);
    if (emoji == null) {
        throw new _error.ApiError(meta.errors.noSuchEmoji);
    }
    const n = await _emoji.default.findOne({
        name: emoji.name,
        host: null
    });
    if (n) {
        throw new _error.ApiError(meta.errors.duplicatedName);
    }
    // ローカル未保存なら保存
    await (0, _emojistore.tryStockEmoji)(emoji);
    emoji = await _emoji.default.findOne(ps.emojiId);
    const copied = await _emoji.default.insert({
        updatedAt: new Date(),
        name: emoji.name,
        host: null,
        aliases: [],
        url: emoji.url,
        type: emoji.type,
        md5: emoji.md5
    });
    return {
        id: copied._id
    };
});

//# sourceMappingURL=copy.js.map
