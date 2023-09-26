"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _logger = require("./logger");
const files = require('./files').default;
const endpoints = files.map((f)=>{
    let ep;
    try {
        ep = require(`./endpoints/${f}`);
    } catch (e) {
        _logger.apiLogger.error(`Cannot load EP:${f}`);
        return null;
    }
    return {
        name: f.replace('.js', ''),
        exec: ep.default,
        meta: ep.meta || {}
    };
}).filter((x)=>x != null);
const _default = endpoints;

//# sourceMappingURL=endpoints.js.map
