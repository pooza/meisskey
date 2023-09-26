"use strict";
Object.defineProperty(exports, "registerOrFetchInstanceDoc", {
    enumerable: true,
    get: function() {
        return registerOrFetchInstanceDoc;
    }
});
const _instance = require("../models/instance");
const _federation = require("../services/chart/federation");
const _converthost = require("../misc/convert-host");
async function registerOrFetchInstanceDoc(host) {
    host = (0, _converthost.toDbHost)(host);
    const index = await _instance.default.findOne({
        host
    });
    if (index == null) {
        const i = await _instance.default.insert({
            host,
            caughtAt: new Date(),
            system: null // TODO
        });
        _federation.default.update(true);
        return i;
    } else {
        return index;
    }
}

//# sourceMappingURL=register-or-fetch-instance-doc.js.map
