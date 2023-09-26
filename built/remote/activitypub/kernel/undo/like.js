"use strict";
Object.defineProperty(exports, /**
 * Process Undo.Like activity
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _type = require("../../type");
const _delete = require("../../../../services/note/reaction/delete");
const _note = require("../../models/note");
const _default = async (actor, activity)=>{
    const targetUri = (0, _type.getApId)(activity.object);
    const note = await (0, _note.fetchNote)(targetUri);
    if (!note) return `skip: target note not found ${targetUri}`;
    await (0, _delete.default)(actor, note).catch((e)=>{
        if (e.id === '60527ec9-b4cb-4a88-a6bd-32d3ad26817d') return;
        throw e;
    });
    return `ok`;
};

//# sourceMappingURL=like.js.map
