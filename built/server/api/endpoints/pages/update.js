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
const _drivefile = require("../../../../models/drive-file");
const _oid = require("../../../../prelude/oid");
const meta = {
    desc: {
        'ja-JP': '指定したページの情報を更新します。'
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
        },
        title: {
            validator: _cafy.default.str
        },
        name: {
            validator: _cafy.default.str.min(1)
        },
        summary: {
            validator: _cafy.default.optional.nullable.str
        },
        content: {
            validator: _cafy.default.arr(_cafy.default.obj())
        },
        variables: {
            validator: _cafy.default.arr(_cafy.default.obj())
        },
        eyeCatchingImageId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform
        },
        font: {
            validator: _cafy.default.optional.str.or([
                'serif',
                'sans-serif'
            ])
        },
        alignCenter: {
            validator: _cafy.default.optional.bool
        },
        sensitive: {
            validator: _cafy.default.optional.bool
        },
        hideTitleWhenPinned: {
            validator: _cafy.default.optional.bool
        }
    },
    errors: {
        noSuchPage: {
            message: 'No such page.',
            code: 'NO_SUCH_PAGE',
            id: '21149b9e-3616-4778-9592-c4ce89f5a864'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '3c15cd52-3b4b-4274-967d-6456fc4f792b'
        },
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: 'cfc23c7c-3887-490e-af30-0ed576703c82'
        },
        nameAlreadyExists: {
            message: 'Specified name already exists.',
            code: 'NAME_ALREADY_EXISTS',
            id: '2298a392-d4a1-44c5-9ebb-ac1aeaa5a9ab'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const page = await _page.default.findOne(ps.pageId);
    if (page == null) {
        throw new _error.ApiError(meta.errors.noSuchPage);
    }
    if (!(0, _oid.oidEquals)(page.userId, user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    let eyeCatchingImage = null;
    if (ps.eyeCatchingImageId != null) {
        eyeCatchingImage = await _drivefile.default.findOne({
            _id: ps.eyeCatchingImageId,
            'metadata.userId': user._id
        });
        if (eyeCatchingImage == null) {
            throw new _error.ApiError(meta.errors.noSuchFile);
        }
    }
    await _page.default.find({
        _id: {
            $ne: ps.pageId
        },
        userId: user._id,
        name: ps.name
    }).then((result)=>{
        if (result.length > 0) {
            throw new _error.ApiError(meta.errors.nameAlreadyExists);
        }
    });
    await _page.default.update({
        _id: page._id
    }, {
        $set: {
            updatedAt: new Date(),
            title: ps.title,
            name: ps.name === undefined ? page.name : ps.name,
            summary: ps.name === undefined ? page.summary : ps.summary,
            content: ps.content,
            variables: ps.variables,
            alignCenter: ps.alignCenter === undefined ? page.alignCenter : ps.alignCenter,
            sensitive: ps.sensitive === undefined ? page.sensitive : ps.sensitive,
            hideTitleWhenPinned: ps.hideTitleWhenPinned === undefined ? page.hideTitleWhenPinned : ps.hideTitleWhenPinned,
            font: ps.font === undefined ? page.font : ps.font,
            eyeCatchingImageId: ps.eyeCatchingImageId === null ? null : ps.eyeCatchingImageId === undefined ? page.eyeCatchingImageId : eyeCatchingImage._id
        }
    });
});

//# sourceMappingURL=update.js.map
