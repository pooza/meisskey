"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _getdrivefileurl = require("../../../misc/get-drive-file-url");
const _default = (file)=>({
        type: 'Document',
        mediaType: file.contentType,
        url: (0, _getdrivefileurl.default)(file)
    });

//# sourceMappingURL=document.js.map
