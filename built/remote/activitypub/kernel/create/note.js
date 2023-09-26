"use strict";
Object.defineProperty(exports, /**
 * 投稿作成アクティビティを捌きます
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _note = require("../../models/note");
const _applock = require("../../../../misc/app-lock");
const _type = require("../../type");
const _converthost = require("../../../../misc/convert-host");
const _fetch = require("../../../../misc/fetch");
async function _default(resolver, actor, note, silent = false, activity) {
    const uri = (0, _type.getApId)(note);
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
    const unlock = await (0, _applock.getApLock)(uri);
    try {
        const exist = await (0, _note.fetchNote)(note);
        if (exist) return 'skip: note exists';
        const n = await (0, _note.createNote)(note, resolver, silent);
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
