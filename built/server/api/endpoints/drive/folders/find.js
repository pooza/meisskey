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
const _cafyid = require("../../../../../misc/cafy-id");
const _drivefolder = require("../../../../../models/drive-folder");
const _define = require("../../../define");
const meta = {
    tags: [
        'drive'
    ],
    requireCredential: true,
    kind: [
        'read:drive',
        'drive-read'
    ],
    params: {
        name: {
            validator: _cafy.default.str
        },
        parentId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            default: null,
            desc: {
                'ja-JP': 'フォルダID'
            }
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
    const folders = await _drivefolder.default.find({
        name: ps.name,
        userId: user._id,
        parentId: ps.parentId
    });
    return await Promise.all(folders.map((folder)=>(0, _drivefolder.pack)(folder)));
});

//# sourceMappingURL=find.js.map
