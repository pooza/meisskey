"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createMfmNode: function() {
        return createMfmNode;
    },
    isHashtag: function() {
        return isHashtag;
    },
    urlRegex: function() {
        return urlRegex;
    },
    urlRegexFull: function() {
        return urlRegexFull;
    }
});
function createMfmNode(type, props = {}, children = []) {
    return {
        type,
        props,
        children
    };
}
function isHashtag(hashtag) {
    if (Array.from(hashtag || '').length > 256) return false;
    return true;
}
const urlRegex = /^https?:\/\/[\w\/:%#@\$&\?!\(\)\[\]~\.,=\+\-]+/;
const urlRegexFull = /^https?:\/\/[\w\/:%#@\$&\?!\(\)\[\]~\.,=\+\-]+$/;

//# sourceMappingURL=utils.js.map
