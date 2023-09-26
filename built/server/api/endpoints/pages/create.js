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
const _ms = require("ms");
const _define = require("../../define");
const _cafyid = require("../../../../misc/cafy-id");
const _error = require("../../error");
const _drivefile = require("../../../../models/drive-file");
const _page = require("../../../../models/page");
const meta = {
    desc: {
        'ja-JP': 'ページを作成します。'
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
    limit: {
        duration: _ms('1hour'),
        max: 300
    },
    params: {
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
            ]),
            default: 'sans-serif'
        },
        alignCenter: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        sensitive: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        hideTitleWhenPinned: {
            validator: _cafy.default.optional.bool,
            default: false
        }
    },
    res: {
        type: 'object',
        optional: false,
        nullable: false,
        ref: 'Page'
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: 'b7b97489-0f66-4b12-a5ff-b21bd63f6e1c'
        },
        nameAlreadyExists: {
            message: 'Specified name already exists.',
            code: 'NAME_ALREADY_EXISTS',
            id: '4650348e-301c-499a-83c9-6aa988c66bc1'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    var _eyeCatchingImage;
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
        userId: user._id,
        name: ps.name
    }).then((result)=>{
        if (result.length > 0) {
            throw new _error.ApiError(meta.errors.nameAlreadyExists);
        }
    });
    const now = new Date();
    const page = await _page.default.insert({
        createdAt: now,
        updatedAt: now,
        title: ps.title,
        name: ps.name,
        summary: ps.summary,
        alignCenter: ps.alignCenter,
        sensitive: ps.sensitive,
        hideTitleWhenPinned: ps.hideTitleWhenPinned,
        font: ps.font,
        userId: user._id,
        eyeCatchingImageId: (_eyeCatchingImage = eyeCatchingImage) === null || _eyeCatchingImage === void 0 ? void 0 : _eyeCatchingImage._id,
        content: ps.content,
        variables: ps.variables,
        visibility: 'public',
        visibleUserIds: [],
        likedCount: 0
    });
    return await (0, _page.packPage)(page, user._id);
});

//# sourceMappingURL=create.js.map
