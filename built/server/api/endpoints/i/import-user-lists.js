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
            id: 'ea9cc34f-c415-4bc6-a6fe-28ac40357049'
        },
        unexpectedFileType: {
            message: 'We need csv file.',
            code: 'UNEXPECTED_FILE_TYPE',
            id: 'a3c9edda-dd9b-4596-be6a-150ef813745c'
        },
        tooBigFile: {
            message: 'That file is too big.',
            code: 'TOO_BIG_FILE',
            id: 'ae6e7a22-971b-4b52-b2be-fc0b9b121fe9'
        },
        emptyFile: {
            message: 'That file is empty.',
            code: 'EMPTY_FILE',
            id: '99efe367-ce6e-4d44-93f8-5fae7b040356'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const file = await _drivefile.default.findOne({
        _id: ps.fileId
    });
    if (file == null) throw new _error.ApiError(meta.errors.noSuchFile);
    //if (!file.contentType.endsWith('/csv')) throw new ApiError(meta.errors.unexpectedFileType);
    if (file.length > 30000) throw new _error.ApiError(meta.errors.tooBigFile);
    if (file.length === 0) throw new _error.ApiError(meta.errors.emptyFile);
    (0, _queue.createImportUserListsJob)(user, file._id);
    return;
});

//# sourceMappingURL=import-user-lists.js.map
