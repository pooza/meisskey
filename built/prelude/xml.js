"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    escapeValue: function() {
        return escapeValue;
    },
    escapeAttribute: function() {
        return escapeAttribute;
    }
});
const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;'
};
const beginingOfCDATA = '<![CDATA[';
const endOfCDATA = ']]>';
function escapeValue(x) {
    let insideOfCDATA = false;
    let builder = '';
    for(let i = 0; i < x.length;){
        if (insideOfCDATA) {
            if (x.slice(i, i + beginingOfCDATA.length) === beginingOfCDATA) {
                insideOfCDATA = true;
                i += beginingOfCDATA.length;
            } else {
                builder += x[i++];
            }
        } else {
            if (x.slice(i, i + endOfCDATA.length) === endOfCDATA) {
                insideOfCDATA = false;
                i += endOfCDATA.length;
            } else {
                const b = x[i++];
                builder += map[b] || b;
            }
        }
    }
    return builder;
}
function escapeAttribute(x) {
    return Object.entries(map).reduce((a, [k, v])=>a.replace(k, v), x);
}

//# sourceMappingURL=xml.js.map
