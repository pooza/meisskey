"use strict";
Object.defineProperty(exports, "serverEventEmitter", {
    enumerable: true,
    get: function() {
        return serverEventEmitter;
    }
});
const _events = require("events");
const _config = require("../config");
const _redis = require("../db/redis");
const serverSubscriber = (0, _redis.createConnection)();
serverSubscriber.subscribe(_config.default.host);
let ServerEventEmitter = class ServerEventEmitter extends _events.EventEmitter {
    constructor(){
        super();
    }
};
const serverEventEmitter = new ServerEventEmitter();
serverSubscriber.on('message', (_, data)=>{
    const parsed = JSON.parse(data);
    serverEventEmitter.emit('message', parsed);
});

//# sourceMappingURL=server-event-emitter.js.map
