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
const _define = require("../../../define");
const _drivefile = require("../../../../../models/drive-file");
const _error = require("../../../error");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
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
            id: 'caf3ca38-c6e5-472e-a30c-b05377dcc240'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const file = await _drivefile.default.findOne({
        _id: ps.fileId
    });
    if (file == null) {
        throw new _error.ApiError(meta.errors.noSuchFile);
    }
    return await (0, _drivefile.pack)(file, {
        detail: true,
        withUser: true,
        self: true
    });
});

//# sourceMappingURL=show-file.js.map
