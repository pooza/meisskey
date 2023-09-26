"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _fetch = require("../misc/fetch");
const _url = require("url");
const _url1 = require("../prelude/url");
async function _default(query) {
    const url = genUrl(query);
    return await (0, _fetch.getJson)(url, 'application/jrd+json, application/json');
}
function genUrl(query) {
    if (query.match(/^https?:\/\//)) {
        const u = new _url.URL(query);
        return `${u.protocol}//${u.hostname}/.well-known/webfinger?` + (0, _url1.query)({
            resource: query
        });
    }
    const m = query.match(/^([^@]+)@(.*)/);
    if (m) {
        const hostname = m[2];
        return `https://${hostname}/.well-known/webfinger?` + (0, _url1.query)({
            resource: `acct:${query}`
        });
    }
    throw new Error(`Invalid query (${query})`);
}

//# sourceMappingURL=webfinger.js.map
