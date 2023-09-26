"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    query: function() {
        return query;
    },
    appendQuery: function() {
        return appendQuery;
    }
});
function query(obj) {
    const params = Object.entries(obj).filter(([, v])=>Array.isArray(v) ? v.length : v !== undefined).reduce((a, [k, v])=>(a[k] = v, a), {});
    return Object.entries(params).map((e)=>`${e[0]}=${encodeURIComponent(e[1])}`).join('&');
}
function appendQuery(url, query) {
    return `${url}${/\?/.test(url) ? url.endsWith('?') ? '' : '&' : '?'}${query}`;
}

//# sourceMappingURL=url.js.map
