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
const _drivefolder = require("../../../../models/drive-folder");
const _define = require("../../define");
const meta = {
    desc: {
        'ja-JP': 'ドライブのフォルダ一覧を取得します。',
        'en-US': 'Get folders of drive.'
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
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'DriveFolder'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const sort = {
        _id: -1
    };
    const query = {
        userId: user._id,
        parentId: ps.folderId
    };
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
    const folders = await _drivefolder.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await Promise.all(folders.map((folder)=>(0, _drivefolder.pack)(folder)));
});

//# sourceMappingURL=folders.js.map
