"use strict";
Object.defineProperty(exports, "addrToPeer", {
    enumerable: true,
    get: function() {
        return addrToPeer;
    }
});
const _ipcidr = require("ip-cidr");
function addrToPeer(addr) {
    if (addr == null) return addr;
    if (addr.includes(':')) {
        // v6は/64単位
        try {
            const cidr = new _ipcidr(`${addr}/64`);
            return cidr.start();
        } catch (e) {
            return null;
        }
    } else {
        return addr;
    }
}

//# sourceMappingURL=addr-to-peer.js.map
