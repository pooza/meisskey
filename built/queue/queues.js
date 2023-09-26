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
    inboxLazyQueue: function() {
        return inboxLazyQueue;
    },
    dbQueue: function() {
        return dbQueue;
    }
});
const _config = require("../config");
const _initialize = require("./initialize");
const deliverQueue = (0, _initialize.initialize)('deliver', _config.default.deliverJobPerSec || -1);
const webpushDeliverQueue = (0, _initialize.initialize)('webpushDeliver', -1);
const inboxQueue = (0, _initialize.initialize)('inbox', _config.default.inboxJobPerSec || -1);
const inboxLazyQueue = (0, _initialize.initialize)('inboxLazy', -1);
const dbQueue = (0, _initialize.initialize)('db');

//# sourceMappingURL=queues.js.map
