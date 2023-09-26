"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packRoom: function() {
        return packRoom;
    }
});
const _deepcopy = require("deepcopy");
const _mongodb = require("../db/mongodb");
const Room = _mongodb.default.get('room');
Room.createIndex([
    'userId',
    'floor'
], {
    unique: true
});
const _default = Room;
async function packRoom(room) {
    const data = room && room.data ? _deepcopy(room.data) : {};
    if (!data.furnitures) data.furnitures = [];
    if (!data.roomType) data.roomType = 'default';
    if (!data.carpetColor) data.carpetColor = '#85CAF0';
    return data;
}

//# sourceMappingURL=room.js.map
