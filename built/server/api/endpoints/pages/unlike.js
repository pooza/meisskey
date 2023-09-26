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
const _cafyid = require("../../../../misc/cafy-id");
const _define = require("../../define");
const _error = require("../../error");
const _page = require("../../../../models/page");
const _pagelike = require("../../../../models/page-like");
const meta = {
    desc: {
        'ja-JP': '指定したページの「いいね」を解除します。'
    },
    tags: [
        'pages'
    ],
    requireCredential: true,
    kind: [
        'write:page-likes',
        'write:favorites',
        'favorite-write'
    ],
    params: {
        pageId: {
            validator: _cafy.default.type(_cafyid.default),
            desc: {
                'ja-JP': '対象のページのID',
                'en-US': 'Target page ID.'
            }
        }
    },
    errors: {
        noSuchPage: {
            message: 'No such page.',
            code: 'NO_SUCH_PAGE',
            id: 'a0d41e20-1993-40bd-890e-f6e560ae648e'
        },
        notLiked: {
            message: 'You have not liked that page.',
            code: 'NOT_LIKED',
            id: 'f5e586b0-ce93-4050-b0e3-7f31af5259ee'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const page = await _page.default.findOne(ps.pageId);
    if (page == null) {
        throw new _error.ApiError(meta.errors.noSuchPage);
    }
    const exist = await _pagelike.default.findOne({
        pageId: page._id,
        userId: user._id
    });
    if (exist == null) {
        throw new _error.ApiError(meta.errors.notLiked);
    }
    // Delete like
    await _pagelike.default.remove(exist._id);
    await _page.default.update({
        _id: page._id
    }, {
        $inc: {
            'likedCount': -1
        }
    });
});

//# sourceMappingURL=unlike.js.map
