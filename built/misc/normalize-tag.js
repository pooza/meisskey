"use strict";
Object.defineProperty(exports, "normalizeTag", {
    enumerable: true,
    get: function() {
        return normalizeTag;
    }
});
function normalizeTag(tag) {
    return tag.normalize('NFKC').toLowerCase();
}

//# sourceMappingURL=normalize-tag.js.map
