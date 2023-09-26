"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    parseFull: function() {
        return parseFull;
    },
    parsePlain: function() {
        return parsePlain;
    },
    parsePlainX: function() {
        return parsePlainX;
    },
    parseBasic: function() {
        return parseBasic;
    }
});
const _language = require("./language");
const _normalize = require("./normalize");
function parseFull(source) {
    if (source == null || source == '') return null;
    return (0, _normalize.normalize)(_language.mfmLanguage.root.tryParse(source));
}
function parsePlain(source) {
    if (source == null || source == '') return null;
    return (0, _normalize.normalize)(_language.mfmLanguage.plain.tryParse(source));
}
function parsePlainX(source) {
    if (source == null || source == '') return null;
    return (0, _normalize.normalize)(_language.mfmLanguage.plainX.tryParse(source));
}
function parseBasic(source) {
    if (source == null || source == '') return null;
    return (0, _normalize.normalize)(_language.mfmLanguage.basic.tryParse(source));
}

//# sourceMappingURL=parse.js.map
