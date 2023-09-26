"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    deliverQueue: function() {
        return deliverQueue;
    },
    webpushDeliverQueue: function() {
        return webpushDeliverQueue;
    },
    inboxQueue: function() {
        return inboxQueue;
    },
    dbQueue: function() {
        return dbQueue;
    }
});
const _config = require("../config");
const _initialize = require("./initialize");
const deliverQueue = (0, _initialize.initialize)('deliver', _config.default.deliverJobPerSec || 128);
const webpushDeliverQueue = (0, _initialize.initialize)('webpushDeliver', 2);
const inboxQueue = (0, _initialize.initialize)('inbox', _config.default.inboxJobPerSec || 16);
const dbQueue = (0, _initialize.initialize)('db');

//# sourceMappingURL=queues.js.map
