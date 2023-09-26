"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const PollVote = _mongodb.default.get('pollVotes');
PollVote.dropIndex([
    'userId',
    'noteId'
], {
    unique: true
}).catch(()=>{});
PollVote.createIndex('userId');
PollVote.createIndex('noteId');
PollVote.createIndex([
    'userId',
    'noteId',
    'choice'
], {
    unique: true
});
const _default = PollVote;

//# sourceMappingURL=poll-vote.js.map
