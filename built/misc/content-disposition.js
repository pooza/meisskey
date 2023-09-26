"use strict";
Object.defineProperty(exports, "contentDisposition", {
    enumerable: true,
    get: function() {
        return contentDisposition;
    }
});
const _contentdisposition = require("content-disposition");
function contentDisposition(type, filename) {
    const fallback = filename.replace(/[^\w.-]/g, '_');
    return _contentdisposition(filename, {
        type,
        fallback
    });
}

//# sourceMappingURL=content-disposition.js.map
