"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    parseDate: function() {
        return parseDate;
    },
    parseDateWithLimit: function() {
        return parseDateWithLimit;
    }
});
function parseDate(input) {
    if (typeof input !== 'string') return null;
    const date = new Date(input);
    if (date.toString() === 'Invalid Date') return null;
    return date;
}
function parseDateWithLimit(input, positiveMs) {
    const date = parseDate(input);
    if (date == null) return null;
    if (date.getTime() - Date.now() > positiveMs) return null;
    return date;
}

//# sourceMappingURL=date.js.map
