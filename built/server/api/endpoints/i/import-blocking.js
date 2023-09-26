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
            id: '91235249-f185-43a4-bbdd-3d77d21cc989'
        },
        unexpectedFileType: {
            message: 'We need csv file.',
            code: 'UNEXPECTED_FILE_TYPE',
            id: '2ae6ec7e-14ba-4f94-aaab-53f5593796b5'
        },
        tooBigFile: {
            message: 'That file is too big.',
            code: 'TOO_BIG_FILE',
            id: 'a8ac0052-c404-4561-ab05-86b0b5e52c65'
        },
        emptyFile: {
            message: 'That file is empty.',
            code: 'EMPTY_FILE',
            id: 'd650cf08-e9b9-4e3e-a337-7e0598c7b7d3'
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
    (0, _queue.createImportBlockingJob)(user, file._id);
    return;
});

//# sourceMappingURL=import-blocking.js.map
