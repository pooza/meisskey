"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getFullApAccount: function() {
        return getFullApAccount;
    },
    isSelfHost: function() {
        return isSelfHost;
    },
    extractDbHost: function() {
        return extractDbHost;
    },
    extractApHost: function() {
        return extractApHost;
    },
    toDbHost: function() {
        return toDbHost;
    },
    toApHost: function() {
        return toApHost;
    }
});
const _config = require("../config");
const _ = require("punycode/");
const _url = require("url");
function getFullApAccount(username, host) {
    return host ? `${username}@${toApHost(host)}` : `${username}@${toApHost(_config.default.host)}`;
}
function isSelfHost(host) {
    if (host == null) return true;
    return toApHost(_config.default.host) === toApHost(host);
}
function extractDbHost(uri) {
    const url = new _url.URL(uri);
    return toDbHost(url.hostname);
}
function extractApHost(uri) {
    const url = new _url.URL(uri);
    return toApHost(url.hostname);
}
function toDbHost(host) {
    if (host == null) return null;
    return (0, _.toUnicode)(host.toLowerCase());
}
function toApHost(host) {
    if (host == null) return null;
    return (0, _.toASCII)(host.toLowerCase());
}

//# sourceMappingURL=convert-host.js.map
