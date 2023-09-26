"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _getdrivefileurl = require("../../../misc/get-drive-file-url");
const _default = (file)=>({
        type: 'Image',
        url: (0, _getdrivefileurl.default)(file),
        sensitive: file.metadata.isSensitive
    });

//# sourceMappingURL=image.js.map
