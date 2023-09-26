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
const _mongodb = require("mongodb");
const _cafyid = require("../../../../../misc/cafy-id");
const _drivefile = require("../../../../../models/drive-file");
const _define = require("../../../define");
const _config = require("../../../../../config");
const _error = require("../../../error");
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '指定したドライブのファイルの情報を取得します。',
        'en-US': 'Get specified file of drive.'
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
        fileId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のファイルID',
                'en-US': 'Target file ID'
            }
        },
        url: {
            validator: _cafy.default.optional.str,
            desc: {
                'ja-JP': '対象のファイルのURL',
                'en-US': 'Target file URL'
            }
        }
    },
    res: {
        type: 'DriveFile'
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: '067bc436-2718-4795-b0fb-ecbe43949e31'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '25b73c73-68b1-41d0-bad1-381cfdf6579f'
        },
        fileIdOrUrlRequired: {
            message: 'fileId or url required.',
            code: 'INVALID_PARAM',
            id: '89674805-722c-440c-8d88-5641830dc3e4'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    let file;
    if (ps.fileId) {
        file = await _drivefile.default.findOne({
            _id: ps.fileId,
            'metadata.deletedAt': {
                $exists: false
            }
        });
    } else if (ps.url) {
        const isInternalStorageUrl = ps.url.startsWith(_config.default.driveUrl);
        if (isInternalStorageUrl) {
            // Extract file ID from url
            // e.g.
            // http://misskey.local/files/foo?original=bar --> foo
            const fileId = new _mongodb.ObjectID(ps.url.replace(_config.default.driveUrl, '').replace(/\?(.*)$/, '').replace(/\//g, ''));
            file = await _drivefile.default.findOne({
                _id: fileId,
                'metadata.deletedAt': {
                    $exists: false
                }
            });
        } else {
            file = await _drivefile.default.findOne({
                $or: [
                    {
                        'metadata.url': ps.url
                    },
                    {
                        'metadata.webpublicUrl': ps.url
                    },
                    {
                        'metadata.thumbnailUrl': ps.url
                    }
                ],
                'metadata.deletedAt': {
                    $exists: false
                }
            });
        }
    } else {
        throw new _error.ApiError(meta.errors.fileIdOrUrlRequired);
    }
    if (!user.isAdmin && !user.isModerator && !file.metadata.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    if (file === null) {
        throw new _error.ApiError(meta.errors.noSuchFile);
    }
    return await (0, _drivefile.pack)(file, {
        detail: true,
        self: true
    });
});

//# sourceMappingURL=show.js.map
