"use strict";
Object.defineProperty(exports, "createTemp", {
    enumerable: true,
    get: function() {
        return createTemp;
    }
});
const _tmp = require("tmp");
function createTemp() {
    return new Promise((res, rej)=>{
        _tmp.file((e, path, fd, cleanup)=>{
            if (e) return rej(e);
            res([
                path,
                cleanup
            ]);
        });
    });
}

//# sourceMappingURL=create-temp.js.map
