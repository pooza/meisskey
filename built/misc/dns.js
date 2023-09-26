"use strict";
Object.defineProperty(exports, "lookup", {
    enumerable: true,
    get: function() {
        return lookup;
    }
});
const _dns = require("dns");
function lookup(hostname, options, callback) {
    if (options.family === 4) {
        _dns.promises.resolve4(hostname).then((addresses)=>{
            callback(null, pickRandom(addresses), 4);
        }).catch((err)=>{
            callback(err);
        });
    } else if (options.family === 6) {
        _dns.promises.resolve6(hostname).then((addresses)=>{
            callback(null, pickRandom(addresses), 6);
        }).catch((err)=>{
            callback(err);
        });
    } else {
        _dns.promises.resolve4(hostname).then((addresses)=>{
            callback(null, pickRandom(addresses), 4);
        }).catch((err4)=>{
            _dns.promises.resolve6(hostname).then((addresses)=>{
                callback(null, pickRandom(addresses), 6);
            }).catch((err6)=>{
                callback(err6);
            });
        });
    }
}
function pickRandom(s) {
    return s[Math.floor(Math.random() * s.length)];
}

//# sourceMappingURL=dns.js.map
