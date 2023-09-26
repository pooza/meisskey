"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _type = require("../type");
const _create = require("../../../services/note/reaction/create");
const _note = require("../models/note");
const _config = require("../../../config");
const _default = async (actor, activity)=>{
    const targetUri = (0, _type.getApId)(activity.object);
    if (_config.default.ignoreForeignLike) {
        const u = new URL(targetUri);
        if (_config.default.hostname !== u.hostname) {
            return `skip: ignore foreign Like`;
        }
    }
    const note = await (0, _note.fetchNote)(targetUri);
    if (!note) return `skip: target note not found ${targetUri}`;
    await (0, _note.extractEmojis)(activity.tag, actor.host).catch(()=>null);
    try {
        await (0, _create.default)(actor, note, activity._misskey_reaction || activity.content || activity.name, (0, _type.getApType)(activity) === 'Dislike');
    } catch (e) {
        if (e.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') return `skip: reacted`;
        if (e.id === 'e70412a4-7197-4726-8e74-f3e0deb92aa7') return `skip: bloked`;
        throw e;
    }
    return `ok`;
};

//# sourceMappingURL=like.js.map
