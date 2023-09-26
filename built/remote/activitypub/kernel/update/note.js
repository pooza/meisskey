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
const _type = require("../../type");
const _converthost = require("../../../../misc/convert-host");
const _note = require("../../models/note");
const _fetch = require("../../../../misc/fetch");
const logger = _logger.apLogger;
async function _default(actor, note) {
    if (typeof note === 'object') {
        if (actor.uri !== note.attributedTo) {
            return `skip: actor.uri !== note.attributedTo`;
        }
        if (typeof note.id === 'string') {
            if ((0, _converthost.extractApHost)(note.id) !== (0, _converthost.extractApHost)(actor.uri)) {
                return `skip: host in actor.uri !== host in note.id`;
            }
        }
    }
    const uri = (0, _type.getApId)(note);
    logger.info(`Update the Note: ${uri}`);
    const unlock = await (0, _applock.getApLock)(uri);
    try {
        const dbResolver = new _dbresolver.default();
        const old = await dbResolver.getNoteFromApId(uri);
        if (!old) return 'skip: old note is not found';
        if (!old.userId.equals(actor._id)) {
            return '投稿をUpdateしようとしているユーザーは投稿の作成者ではありません';
        }
        await (0, _delete.default)(actor, old);
        const n = await (0, _note.createNote)(note);
        return n ? 'ok' : 'skip';
    } catch (e) {
        if (e instanceof _fetch.StatusError && e.isClientError) {
            return `skip ${e.statusCode}`;
        } else {
            throw e;
        }
    } finally{
        unlock();
    }
}

//# sourceMappingURL=note.js.map
