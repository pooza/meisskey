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
const _drivefile = require("../../../../../models/drive-file");
const _stream = require("../../../../../services/stream");
const _define = require("../../../define");
const _note = require("../../../../../models/note");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': '指定したドライブのファイルの情報を更新します。',
        'en-US': 'Update specified file of drive.'
    },
    tags: [
        'drive'
    ],
    requireCredential: true,
    kind: [
        'write:drive',
        'drive-write'
    ],
    params: {
        fileId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のファイルID'
            }
        },
        folderId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            default: undefined,
            desc: {
                'ja-JP': 'フォルダID'
            }
        },
        name: {
            validator: _cafy.default.optional.str.pipe(_drivefile.validateFileName),
            default: undefined,
            desc: {
                'ja-JP': 'ファイル名',
                'en-US': 'Name of the file'
            }
        },
        isSensitive: {
            validator: _cafy.default.optional.bool,
            default: undefined,
            desc: {
                'ja-JP': 'このメディアが「閲覧注意」(NSFW)かどうか',
                'en-US': 'Whether this media is NSFW'
            }
        }
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: 'e7778c7e-3af9-49cd-9690-6dbc3e6c972d'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '01a53b27-82fc-445b-a0c1-b558465a8ed2'
        },
        noSuchFolder: {
            message: 'No such folder.',
            code: 'NO_SUCH_FOLDER',
            id: 'ea8fb7a5-af77-4a08-b608-c0218176cd73'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch file
    const file = await _drivefile.default.findOne({
        _id: ps.fileId
    });
    if (file === null) {
        throw new _error.ApiError(meta.errors.noSuchFile);
    }
    if (!user.isAdmin && !user.isModerator && !file.metadata.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    if (ps.name) file.filename = ps.name;
    if (ps.isSensitive !== undefined) file.metadata.isSensitive = ps.isSensitive;
    if (ps.folderId !== undefined) {
        if (ps.folderId === null) {
            file.metadata.folderId = null;
        } else {
            // Fetch folder
            const folder = await _drivefolder.default.findOne({
                _id: ps.folderId,
                userId: user._id
            });
            if (folder === null) {
                throw new _error.ApiError(meta.errors.noSuchFolder);
            }
            file.metadata.folderId = folder._id;
        }
    }
    await _drivefile.default.update(file._id, {
        $set: {
            filename: file.filename,
            'metadata.folderId': file.metadata.folderId,
            'metadata.isSensitive': file.metadata.isSensitive
        }
    });
    // ドライブのファイルが非正規化されているドキュメントも更新
    _note.default.find({
        '_files._id': file._id
    }).then((notes)=>{
        for (const note of notes){
            note._files[note._files.findIndex((f)=>f._id.equals(file._id))] = file;
            _note.default.update({
                _id: note._id
            }, {
                $set: {
                    _files: note._files
                }
            });
        }
    });
    const fileObj = await (0, _drivefile.pack)(file, {
        detail: true,
        self: true
    });
    // Publish fileUpdated event
    (0, _stream.publishDriveStream)(user._id, 'fileUpdated', fileObj);
    return fileObj;
});

//# sourceMappingURL=update.js.map
