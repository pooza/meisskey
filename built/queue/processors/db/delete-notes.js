"use strict";
Object.defineProperty(exports, "deleteNotes", {
    enumerable: true,
    get: function() {
        return deleteNotes;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _note = require("../../../models/note");
const _delete = require("../../../services/note/delete");
const _user = require("../../../models/user");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const logger = _logger.queueLogger.createSubLogger('delete-notes');
async function deleteNotes(job) {
    logger.info(`Deleting notes of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
    let deletedCount = 0;
    let cursor = null;
    const total = await _note.default.count({
        userId: user._id
    });
    while(true){
        const notes = await _note.default.find(_object_spread({
            userId: user._id
        }, cursor ? {
            _id: {
                $gt: cursor
            }
        } : {}), {
            limit: 100,
            sort: {
                _id: 1
            }
        });
        if (notes.length === 0) {
            job.progress(100);
            break;
        }
        cursor = notes[notes.length - 1]._id;
        for (const note of notes){
            await (0, _delete.default)(user, note, true);
            deletedCount++;
        }
        job.progress(deletedCount / total);
    }
    return `ok: All notes (${deletedCount}) of ${user._id} has been deleted.`;
}

//# sourceMappingURL=delete-notes.js.map
