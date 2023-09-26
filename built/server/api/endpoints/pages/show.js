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
const _error = require("../../error");
const _cafyid = require("../../../../misc/cafy-id");
const _page = require("../../../../models/page");
const _user = require("../../../../models/user");
const _getters = require("../../common/getters");
const meta = {
    desc: {
        'ja-JP': '指定したページの情報を取得します。'
    },
    tags: [
        'pages'
    ],
    requireCredential: false,
    params: {
        pageId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            desc: {
                'ja-JP': '対象のページのID',
                'en-US': 'Target page ID.'
            }
        },
        name: {
            validator: _cafy.default.optional.str
        },
        username: {
            validator: _cafy.default.optional.str
        }
    },
    res: {
        type: 'object',
        optional: false,
        nullable: false,
        ref: 'Page'
    },
    errors: {
        noSuchPage: {
            message: 'No such page.',
            code: 'NO_SUCH_PAGE',
            id: '222120c0-3ead-4528-811b-b96f233388d7'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    var _user1;
    let page;
    if (ps.pageId) {
        page = await _page.default.findOne(ps.pageId);
    } else if (ps.name && ps.username) {
        const author = await _user.default.findOne({
            host: null,
            usernameLower: ps.username.toLowerCase()
        });
        if (author) {
            page = await _page.default.findOne({
                name: ps.name,
                userId: author._id
            });
        }
    }
    if (page == null) {
        throw new _error.ApiError(meta.errors.noSuchPage);
    }
    const u = await (0, _getters.getUser)(page.userId);
    if (u.isDeleted || u.isSuspended) throw new _error.ApiError(meta.errors.noSuchPage);
    return await (0, _page.packPage)(page, (_user1 = user) === null || _user1 === void 0 ? void 0 : _user1._id);
});

//# sourceMappingURL=show.js.map
