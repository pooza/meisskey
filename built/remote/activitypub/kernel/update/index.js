"use strict";
Object.defineProperty(exports, /**
 * Updateアクティビティを捌きます
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _type = require("../../type");
const _logger = require("../../logger");
const _question = require("../../models/question");
const _resolver = require("../../resolver");
const _person = require("../../models/person");
const _default = async (actor, activity)=>{
    if ('actor' in activity && actor.uri !== activity.actor) {
        return `skip: invalid actor`;
    }
    _logger.apLogger.debug('Update');
    const resolver = new _resolver.default();
    const object = await resolver.resolve(activity.object).catch((e)=>{
        _logger.apLogger.error(`Resolution failed: ${e}`);
        throw e;
    });
    if ((0, _type.isActor)(object)) {
        await (0, _person.updatePerson)(actor.uri, resolver, object);
        return `ok: Person updated`;
    } else if ((0, _type.getApType)(object) === 'Question') {
        await (0, _question.updateQuestion)(object, resolver).catch((e)=>console.log(e));
        return `ok: Question updated`;
    } else {
        return `skip: Unknown type: ${(0, _type.getApType)(object)}`;
    }
};

//# sourceMappingURL=index.js.map
