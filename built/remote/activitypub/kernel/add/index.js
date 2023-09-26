"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _note = require("../../models/note");
const _pin = require("../../../../services/i/pin");
const _default = async (actor, activity)=>{
    if ('actor' in activity && actor.uri !== activity.actor) {
        return `skip: invalid actor`;
    }
    if (activity.target == null) {
        return `skip: target is null`;
    }
    if (activity.target === actor.featured) {
        const note = await (0, _note.resolveNote)(activity.object);
        await (0, _pin.addPinned)(actor, note._id);
        return `ok`;
    }
    return `skip: unknown target: ${activity.target}`;
};

//# sourceMappingURL=index.js.map
