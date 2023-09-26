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
const _ms = require("ms");
const _cafy = require("cafy");
const _cafyid = require("../../../../../misc/cafy-id");
const _drivefile = require("../../../../../models/drive-file");
const _addfile = require("../../../../../services/drive/add-file");
const _define = require("../../../define");
const _logger = require("../../../logger");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': 'ドライブにファイルをアップロードします。',
        'en-US': 'Upload a file to drive.'
    },
    tags: [
        'drive'
    ],
    requireCredential: true,
    limit: {
        duration: _ms('1hour'),
        max: 120
    },
    requireFile: true,
    kind: [
        'write:drive',
        'drive-write'
    ],
    params: {
        folderId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            default: null,
            desc: {
                'ja-JP': 'フォルダID'
            }
        },
        name: {
            validator: _cafy.default.optional.nullable.str,
            default: null,
            desc: {
                'ja-JP': 'ファイル名（拡張子があるなら含めて）'
            }
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
    },
    res: {
        type: 'DriveFile'
    },
    errors: {
        invalidFileName: {
            message: 'Invalid file name.',
            code: 'INVALID_FILE_NAME',
            id: 'f449b209-0c60-4e51-84d5-29486263bfd4'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user, app, file, cleanup)=>{
    // Get 'name' parameter
    let name = ps.name || file.originalname;
    if (name !== undefined && name !== null) {
        name = name.trim();
        if (name.length === 0) {
            name = null;
        } else if (name === 'blob') {
            name = null;
        } else if (!(0, _drivefile.validateFileName)(name)) {
            throw new _error.ApiError(meta.errors.invalidFileName);
        }
    } else {
        name = null;
    }
    try {
        const driveFile = await (0, _addfile.addFile)({
            user,
            path: file.path,
            name,
            folderId: ps.folderId,
            force: ps.force,
            sensitive: ps.isSensitive
        });
        return (0, _drivefile.pack)(driveFile, {
            detail: true,
            self: true
        });
    } catch (e) {
        _logger.apiLogger.error(e);
        throw new _error.ApiError();
    } finally{
        cleanup();
    }
});

//# sourceMappingURL=create.js.map
