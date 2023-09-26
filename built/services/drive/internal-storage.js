"use strict";
Object.defineProperty(exports, "InternalStorage", {
    enumerable: true,
    get: function() {
        return InternalStorage;
    }
});
const _fs = require("fs");
const _path = require("path");
const _config = require("../../config");
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
let InternalStorage = class InternalStorage {
    static read(key) {
        return _fs.createReadStream(InternalStorage.resolvePath(key));
    }
    static async saveFromPathAsync(key, srcPath) {
        await _fs.promises.mkdir(InternalStorage.path, {
            recursive: true
        });
        await _fs.promises.copyFile(srcPath, InternalStorage.resolvePath(key));
        return `${_config.default.url}/files/${key}`;
    }
    static async saveFromBufferAsync(key, data) {
        await _fs.promises.mkdir(InternalStorage.path, {
            recursive: true
        });
        await _fs.promises.writeFile(InternalStorage.resolvePath(key), data);
        return `${_config.default.url}/files/${key}`;
    }
    static del(key) {
        // eslint-disable-next-line node/prefer-promises/fs
        _fs.unlink(InternalStorage.resolvePath(key), ()=>{});
    }
};
_define_property(InternalStorage, "path", _path.resolve(__dirname, '../../../files'));
_define_property(InternalStorage, "resolvePath", (key)=>_path.resolve(InternalStorage.path, key));

//# sourceMappingURL=internal-storage.js.map
