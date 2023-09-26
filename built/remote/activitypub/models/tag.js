"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    extractApHashtags: function() {
        return extractApHashtags;
    },
    extractApHashtagObjects: function() {
        return extractApHashtagObjects;
    }
});
const _array = require("../../../prelude/array");
const _type = require("../type");
function extractApHashtags(tags) {
    if (tags == null) return [];
    const hashtags = extractApHashtagObjects(tags);
    return hashtags.map((tag)=>{
        const m = tag.name.match(/^#(.+)/);
        return m ? m[1] : null;
    }).filter((x)=>x != null);
}
function extractApHashtagObjects(tags) {
    if (tags == null) return [];
    return (0, _array.toArray)(tags).filter(_type.isHashtag);
}

//# sourceMappingURL=tag.js.map
