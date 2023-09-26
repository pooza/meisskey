"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    typeFilterValidater: function() {
        return typeFilterValidater;
    },
    genTypeFilterRegex: function() {
        return genTypeFilterRegex;
    }
});
const escapeRegExp = require("escape-regexp");
const typeFilterValidater = /^([*]|[a-z]+)[/]([*]|[0-9A-Za-z+.-]+)$/;
function genTypeFilterRegex(pattern) {
    const m = pattern.match(typeFilterValidater);
    if (!m) throw 'Invalid pattern';
    const cnv = (x)=>x === '*' ? '[^/]+' : escapeRegExp(x);
    return new RegExp(`^${cnv(m[1])}[/]${cnv(m[2])}$`);
}

//# sourceMappingURL=mime-type-filter.js.map
