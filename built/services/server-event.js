"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    publishFollowingChanged: function() {
        return publishFollowingChanged;
    },
    publishMutingChanged: function() {
        return publishMutingChanged;
    },
    publishFilterChanged: function() {
        return publishFilterChanged;
    },
    publishTerminate: function() {
        return publishTerminate;
    },
    publishInstanceModUpdated: function() {
        return publishInstanceModUpdated;
    }
});
const _stream = require("./stream");
async function publishFollowingChanged(userId) {
    await (0, _stream.publishServerEvent)(userId, 'followingChanged');
}
async function publishMutingChanged(userId) {
    await (0, _stream.publishServerEvent)(userId, 'mutingChanged');
}
async function publishFilterChanged(userId) {
    await (0, _stream.publishServerEvent)(userId, 'filterChanged');
}
async function publishTerminate(userId) {
    await (0, _stream.publishServerEvent)(userId, 'terminate');
}
async function publishInstanceModUpdated() {
    await (0, _stream.publishServerEvent)(null, 'instanceModUpdated');
}

//# sourceMappingURL=server-event.js.map
