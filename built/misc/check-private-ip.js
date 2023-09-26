"use strict";
Object.defineProperty(exports, "checkPrivateIp", {
    enumerable: true,
    get: function() {
        return checkPrivateIp;
    }
});
const _config = require("../config");
const _ipcidr = require("ip-cidr");
const PrivateIp = require('private-ip');
function checkPrivateIp(ip) {
    if (process.env.NODE_ENV === 'production' && !_config.default.proxy && ip) {
        // check exclusion
        for (const net of _config.default.allowedPrivateNetworks || []){
            const cidr = new _ipcidr(net);
            if (cidr.contains(ip)) {
                return false;
            }
        }
        return PrivateIp(ip);
    } else {
        return false;
    }
}

//# sourceMappingURL=check-private-ip.js.map
