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
const _define = require("../../define");
const _queue = require("../../../../queue");
const _drivefile = require("../../../../models/drive-file");
const _error = require("../../error");
const ms = require("ms");
const meta = {
    secure: true,
    requireCredential: true,
    limit: {
        duration: ms('1hour'),
        max: 5
    },
    params: {
        fileId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    errors: {
        noSuchFile: {
            message: 'No such file.',
            code: 'NO_SUCH_FILE',
            id: '8b298b72-31bd-4fc0-b5f0-99d12a098d6c'
        },
        unexpectedFileType: {
            message: 'We need csv file.',
            code: 'UNEXPECTED_FILE_TYPE',
            id: 'cfa45c3f-ca95-48b2-bfd0-60210114fcba'
        },
        tooBigFile: {
            message: 'That file is too big.',
            code: 'TOO_BIG_FILE',
            id: 'd536adb5-2f96-4710-a108-bb8f9842f4f4'
        },
        emptyFile: {
            message: 'That file is empty.',
            code: 'EMPTY_FILE',
            id: 'e28e6b3f-8477-4e33-89a1-bd6379793f3d'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const file = await _drivefile.default.findOne({
        _id: ps.fileId
    });
    if (file == null) throw new _error.ApiError(meta.errors.noSuchFile);
    //if (!file.contentType.endsWith('/csv')) throw new ApiError(meta.errors.unexpectedFileType);
    if (file.length > 50000) throw new _error.ApiError(meta.errors.tooBigFile);
    if (file.length === 0) throw new _error.ApiError(meta.errors.emptyFile);
    (0, _queue.createImportMuteJob)(user, file._id);
    return;
});

//# sourceMappingURL=import-mute.js.map
