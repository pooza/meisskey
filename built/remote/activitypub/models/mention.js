"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    extractApMentions: function() {
        return extractApMentions;
    },
    extractApMentionObjects: function() {
        return extractApMentionObjects;
    }
});
const _array = require("../../../prelude/array");
const _type = require("../type");
const _person = require("./person");
const _promiselimit = require("promise-limit");
async function extractApMentions(tags, resolver) {
    const hrefs = (0, _array.unique)(extractApMentionObjects(tags).map((x)=>x.href));
    const limit = _promiselimit(2);
    const mentionedUsers = (await Promise.all(hrefs.map((x)=>limit(()=>(0, _person.resolvePerson)(x, null, resolver).catch(()=>null))))).filter((x)=>x != null);
    return mentionedUsers;
}
function extractApMentionObjects(tags) {
    if (tags == null) return [];
    return (0, _array.toArray)(tags).filter(_type.isMention);
}

//# sourceMappingURL=mention.js.map
