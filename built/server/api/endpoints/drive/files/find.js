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
const _drivefile = require("../../../../../models/drive-file");
const _define = require("../../../define");
const meta = {
    requireCredential: true,
    tags: [
        'drive'
    ],
    kind: [
        'read:drive',
        'drive-read'
    ],
    params: {
        name: {
            validator: _cafy.default.str
        },
        folderId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            default: null,
            desc: {
                'ja-JP': 'フォルダID'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const files = await _drivefile.default.find({
        filename: ps.name,
        'metadata.userId': user._id,
        'metadata.folderId': ps.folderId
    });
    return await Promise.all(files.map((file)=>(0, _drivefile.pack)(file, {
            self: true
        })));
});

//# sourceMappingURL=find.js.map
