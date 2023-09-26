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
const _drivefile = require("../../../../../models/drive-file");
const _define = require("../../../define");
const meta = {
    desc: {
        'ja-JP': '与えられたMD5ハッシュ値を持つファイルがドライブに存在するかどうかを返します。',
        'en-US': 'Returns whether the file with the given MD5 hash exists in the user\'s drive.'
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
        md5: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'ファイルのMD5ハッシュ'
            }
        }
    },
    res: {
        type: 'DriveFile'
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const file = await _drivefile.default.findOne({
        md5: ps.md5,
        'metadata.userId': user._id,
        'metadata.deletedAt': {
            $exists: false
        }
    });
    return {
        file: file ? await (0, _drivefile.pack)(file, {
            self: true
        }) : null
    };
});

//# sourceMappingURL=check-existence.js.map
