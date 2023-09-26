"use strict";
Object.defineProperty(exports, /**
 * 削除アクティビティを捌きます
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _note = require("./note");
const _actor = require("./actor");
const _type = require("../../type");
const _array = require("../../../../prelude/array");
const _default = async (actor, activity)=>{
    if ('actor' in activity && actor.uri !== activity.actor) {
        throw new Error('invalid actor');
    }
    // 削除対象objectのtype
    let formarType;
    if (typeof activity.object === 'string') {
        // typeが不明だけど、どうせ消えてるのでremote resolveしない
        formarType = undefined;
    } else {
        const object = activity.object;
        if ((0, _type.isTombstone)(object)) {
            formarType = (0, _array.toSingle)(object.formerType);
        } else {
            formarType = (0, _array.toSingle)(object.type);
        }
    }
    const uri = (0, _type.getApId)(activity.object);
    // type不明でもactorとobjectが同じならばそれはPersonに違いない
    if (!formarType && actor.uri === uri) {
        formarType = 'Person';
    }
    // それでもなかったらおそらくNote
    if (!formarType) {
        formarType = 'Note';
    }
    if (_type.validPost.includes(formarType)) {
        return await (0, _note.default)(actor, uri);
    } else if (_type.validActor.includes(formarType)) {
        return await (0, _actor.default)(actor, uri);
    } else {
        return `Unknown type ${formarType}`;
    }
};

//# sourceMappingURL=index.js.map
