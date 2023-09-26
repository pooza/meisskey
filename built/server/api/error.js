"use strict";
Object.defineProperty(exports, "ApiError", {
    enumerable: true,
    get: function() {
        return ApiError;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
let ApiError = class ApiError extends Error {
    constructor(e, info){
        if (e == null) e = {
            message: 'Internal error occurred. Please contact us if the error persists.',
            code: 'INTERNAL_ERROR',
            id: '5d37dbcb-891e-41ca-a3d6-e690c97775ac',
            kind: 'server',
            httpStatusCode: 500
        };
        super(e.message);
        _define_property(this, "message", void 0);
        _define_property(this, "code", void 0);
        _define_property(this, "id", void 0);
        _define_property(this, "kind", void 0);
        _define_property(this, "httpStatusCode", void 0);
        _define_property(this, "info", void 0);
        this.message = e.message;
        this.code = e.code;
        this.id = e.id;
        this.kind = e.kind || 'client';
        this.httpStatusCode = e.httpStatusCode;
        this.info = info;
    }
};

//# sourceMappingURL=error.js.map
