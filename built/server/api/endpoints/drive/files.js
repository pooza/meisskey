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
const _mimetypefilter = require("../../../../misc/mime-type-filter");
const _drivefile = require("../../../../models/drive-file");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'ドライブのファイル一覧を取得します。',
        'en-US': 'Get files of drive.'
    },
    tags: [
        'drive'
    ],
    requireCredential: true,
    kind: [
        'read:drive',
        'drive-read'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        folderId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            default: null,
            transform: _cafyid.transform
        },
        attached: {
            validator: _cafy.default.optional.str.or([
                'all',
                'attached',
                'notAttached'
            ])
        },
        type: {
            validator: _cafy.default.optional.str.match(_mimetypefilter.typeFilterValidater)
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'DriveFile'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const sort = {
        _id: -1
    };
    const query = {
        'metadata.userId': user._id,
        'metadata.folderId': ps.folderId,
        'metadata.deletedAt': {
            $exists: false
        },
        $and: [
            {}
        ]
    };
    if (ps.attached === 'attached') {
        query.$and.push({
            $or: [
                {
                    'metadata.attachedNoteIds.0': {
                        $exists: true
                    }
                },
                {
                    'metadata.attachedMessageIds.0': {
                        $exists: true
                    }
                },
                {
                    _id: user.avatarId
                },
                {
                    _id: user.bannerId
                }
            ]
        });
    } else if (ps.attached === 'notAttached') {
        query.$and.push({
            $and: [
                {
                    'metadata.attachedNoteIds.0': {
                        $exists: true
                    }
                },
                {
                    'metadata.attachedMessageIds.0': {
                        $exists: true
                    }
                },
                {
                    _id: user.avatarId
                },
                {
                    _id: user.bannerId
                }
            ]
        });
    }
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    if (ps.type) {
        query.contentType = (0, _mimetypefilter.genTypeFilterRegex)(ps.type);
    }
    const files = await _drivefile.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _drivefile.packMany)(files, {
        detail: true,
        self: true
    });
});

//# sourceMappingURL=files.js.map
