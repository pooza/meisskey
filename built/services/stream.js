"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    publishMainStream: function() {
        return publishMainStream;
    },
    publishDriveStream: function() {
        return publishDriveStream;
    },
    publishNoteStream: function() {
        return publishNoteStream;
    },
    publishUserListStream: function() {
        return publishUserListStream;
    },
    publishMessagingStream: function() {
        return publishMessagingStream;
    },
    publishMessagingIndexStream: function() {
        return publishMessagingIndexStream;
    },
    publishReversiStream: function() {
        return publishReversiStream;
    },
    publishReversiGameStream: function() {
        return publishReversiGameStream;
    },
    publishNotesStream: function() {
        return publishNotesStream;
    },
    publishHotStream: function() {
        return publishHotStream;
    },
    publishAdminStream: function() {
        return publishAdminStream;
    },
    publishServerEvent: function() {
        return publishServerEvent;
    }
});
const _redis = require("../db/redis");
const _config = require("../config");
function publish(channel, type, value) {
    const message = type == null ? value : value == null ? {
        type: type,
        body: null
    } : {
        type: type,
        body: value
    };
    _redis.default.publish(_config.default.host, JSON.stringify({
        channel: channel,
        message: message
    }));
}
function publishMainStream(userId, type, value) {
    publish(`mainStream:${userId}`, type, typeof value === 'undefined' ? null : value);
}
function publishDriveStream(userId, type, value) {
    publish(`driveStream:${userId}`, type, typeof value === 'undefined' ? null : value);
}
function publishNoteStream(noteId, type, value) {
    publish(`noteStream:${noteId}`, type, {
        id: noteId,
        body: value
    });
}
function publishUserListStream(listId, type, value) {
    publish(`userListStream:${listId}`, type, typeof value === 'undefined' ? null : value);
}
function publishMessagingStream(userId, otherpartyId, type, value) {
    publish(`messagingStream:${userId}-${otherpartyId}`, type, typeof value === 'undefined' ? null : value);
}
function publishMessagingIndexStream(userId, type, value) {
    publish(`messagingIndexStream:${userId}`, type, typeof value === 'undefined' ? null : value);
}
function publishReversiStream(userId, type, value) {
    publish(`reversiStream:${userId}`, type, typeof value === 'undefined' ? null : value);
}
function publishReversiGameStream(gameId, type, value) {
    publish(`reversiGameStream:${gameId}`, type, typeof value === 'undefined' ? null : value);
}
function publishNotesStream(note) {
    publish('notesStream', null, note);
}
function publishHotStream(note) {
    publish(`hotStream`, null, note);
}
function publishAdminStream(userId, type, value) {
    publish(`adminStream:${userId}`, type, typeof value === 'undefined' ? null : value);
}
function publishServerEvent(userId, type, value) {
    const name = userId ? `serverEvent:${userId}` : `serverEvent`;
    publish(name, type, typeof value === 'undefined' ? null : value);
}

//# sourceMappingURL=stream.js.map
