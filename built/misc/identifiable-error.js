/**
 * ID付きエラー
 */ "use strict";
Object.defineProperty(exports, "IdentifiableError", {
    enumerable: true,
    get: function() {
        return IdentifiableError;
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
let IdentifiableError = class IdentifiableError extends Error {
    constructor(id, message){
        super(message);
        _define_property(this, "message", void 0);
        _define_property(this, "id", void 0);
        this.message = message;
        this.id = id;
    }
};

//# sourceMappingURL=identifiable-error.js.map
