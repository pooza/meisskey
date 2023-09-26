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
const _oid = require("../../../../prelude/oid");
const meta = {
    desc: {
        'ja-JP': '指定したページを削除します。'
    },
    tags: [
        'pages'
    ],
    requireCredential: true,
    kind: [
        'write:pages',
        'write:notes',
        'note-write'
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
            id: 'eb0c6e1d-d519-4764-9486-52a7e1c6392a'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '8b741b3e-2c22-44b3-a15f-29949aa1601e'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const page = await _page.default.findOne({
        _id: ps.pageId
    });
    if (page == null) {
        throw new _error.ApiError(meta.errors.noSuchPage);
    }
    if (!(0, _oid.oidEquals)(page.userId, user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    await _page.default.remove({
        _id: page._id
    });
});

//# sourceMappingURL=delete.js.map
