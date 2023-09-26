"use strict";
Object.defineProperty(exports, "deleteUnusedFile", {
    enumerable: true,
    get: function() {
        return deleteUnusedFile;
    }
});
const _drivefile = require("../../models/drive-file");
const _user = require("../../models/user");
const _deletefile = require("./delete-file");
const _oid = require("../../prelude/oid");
async function deleteUnusedFile(fileId, detail = false) {
    var _file_metadata, _file;
    const file = await _drivefile.default.findOne(fileId);
    if (!((_file = file) === null || _file === void 0 ? void 0 : (_file_metadata = _file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.userId)) {
        return;
    }
    const user = await _user.default.findOne(file.metadata.userId);
    if (!(0, _user.isRemoteUser)(user)) {
        if (detail) console.log(`  ${file._id} not a remote user`);
        return;
    }
    if ((0, _oid.oidEquals)(file._id, user.avatarId) || (0, _oid.oidEquals)(file._id, user.bannerId)) {
        if (detail) console.log(`  ${file._id} avatar or banner attached`);
        return;
    }
    if (!file.metadata.attachedNoteIds || file.metadata.attachedNoteIds.length !== 0) {
        if (detail) console.log(`  ${file._id} note attached`);
        return;
    }
    if (!file.metadata.attachedMessageIds || file.metadata.attachedMessageIds.length !== 0) {
        if (detail) console.log(`  ${file._id} message attached`);
        return;
    }
    if (detail) console.log(`  ${file._id} delete`);
    await (0, _deletefile.default)(file);
}

//# sourceMappingURL=delete-unused-file.js.map
