"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _fs = require("fs");
const _error = require("./error");
function _default(meta, cb) {
    return (params, user, app, file)=>{
        function cleanup() {
            _fs.unlink(file.path, ()=>{});
        }
        if (meta.requireFile && file == null) return Promise.reject(new _error.ApiError({
            message: 'File required.',
            code: 'FILE_REQUIRED',
            id: '4267801e-70d1-416a-b011-4ee502885d8b'
        }));
        const [ps, pserr] = getParams(meta, params);
        if (pserr) {
            if (file) cleanup();
            return Promise.reject(pserr);
        }
        return cb(ps, user, app, file, cleanup);
    };
}
function getParams(defs, params) {
    if (defs.params == null) return [
        params,
        null
    ];
    const x = {};
    let err = null;
    Object.entries(defs.params).some(([k, def])=>{
        const [v, e] = def.validator.get(params[k]);
        if (e) {
            err = new _error.ApiError({
                message: 'Invalid param.',
                code: 'INVALID_PARAM',
                id: '3d81ceae-475f-4600-b2a8-2bc116157532'
            }, {
                param: k,
                reason: e.message
            });
            return true;
        } else {
            if (v === undefined && def.hasOwnProperty('default')) {
                x[k] = def.default;
            } else {
                x[k] = v;
            }
            if (def.transform) x[k] = def.transform(x[k]);
            return false;
        }
    });
    return [
        x,
        err
    ];
}

//# sourceMappingURL=define.js.map
