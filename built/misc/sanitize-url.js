"use strict";
Object.defineProperty(exports, "sanitizeUrl", {
    enumerable: true,
    get: function() {
        return sanitizeUrl;
    }
});
function sanitizeUrl(str) {
    if (str == null) return str;
    try {
        const u = new URL(str);
        if (u.protocol === 'https:') return str;
        if (u.protocol === 'http:') return str;
    } catch (e) {
        return null;
    }
    return null;
}

//# sourceMappingURL=sanitize-url.js.map
