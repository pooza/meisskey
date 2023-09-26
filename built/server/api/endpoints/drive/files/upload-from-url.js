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
const _ms = require("ms");
const _drivefile = require("../../../../../models/drive-file");
const _uploadfromurl = require("../../../../../services/drive/upload-from-url");
const _define = require("../../../define");
const meta = {
    desc: {
        'ja-JP': 'ドライブに指定されたURLに存在するファイルをアップロードします。'
    },
    tags: [
        'drive'
    ],
    limit: {
        duration: _ms('1hour'),
        max: 60
    },
    requireCredential: true,
    kind: [
        'write:drive',
        'drive-write'
    ],
    params: {
        url: {
            // TODO: Validate this url
            validator: _cafy.default.str
        },
        folderId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            default: null,
            transform: _cafyid.transform
        },
        isSensitive: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'このメディアが「閲覧注意」(NSFW)かどうか',
                'en-US': 'Whether this media is NSFW'
            }
        },
        force: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'true にすると、同じハッシュを持つファイルが既にアップロードされていても強制的にファイルを作成します。'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    return await (0, _drivefile.pack)(await (0, _uploadfromurl.uploadFromUrl)({
        url: ps.url,
        user,
        folderId: ps.folderId,
        sensitive: ps.isSensitive,
        force: ps.force
    }), {
        self: true
    });
});

//# sourceMappingURL=upload-from-url.js.map
