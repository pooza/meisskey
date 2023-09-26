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
            id: 'b98644cf-a5ac-4277-a502-0b8054a709a3'
        },
        unexpectedFileType: {
            message: 'We need csv file.',
            code: 'UNEXPECTED_FILE_TYPE',
            id: '660f3599-bce0-4f95-9dde-311fd841c183'
        },
        tooBigFile: {
            message: 'That file is too big.',
            code: 'TOO_BIG_FILE',
            id: 'dee9d4ed-ad07-43ed-8b34-b2856398bc60'
        },
        emptyFile: {
            message: 'That file is empty.',
            code: 'EMPTY_FILE',
            id: '31a1b42c-06f7-42ae-8a38-a661c5c9f691'
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
    (0, _queue.createImportFollowingJob)(user, file._id);
    return;
});

//# sourceMappingURL=import-following.js.map
