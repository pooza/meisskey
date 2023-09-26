"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _delete = require("../../../../services/note/delete");
const _logger = require("../../logger");
const _applock = require("../../../../misc/app-lock");
const _dbresolver = require("../../db-resolver");
const logger = _logger.apLogger;
async function _default(actor, uri) {
    logger.info(`Deleting the Note: ${uri}`);
    const unlock = await (0, _applock.getApLock)(uri);
    try {
        const dbResolver = new _dbresolver.default();
        const note = await dbResolver.getNoteFromApId(uri);
        if (note == null) {
            return 'skip: note not found';
        }
        if (!note.userId.equals(actor._id)) {
            return '投稿を削除しようとしているユーザーは投稿の作成者ではありません';
        }
        await (0, _delete.default)(actor, note);
        return 'ok: note deleted';
    } finally{
        unlock();
    }
}

//# sourceMappingURL=note.js.map
