"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return renderVote;
    }
});
const _config = require("../../../config");
async function renderVote(user, vote, pollNote, pollOwner) {
    return {
        id: `${_config.default.url}/users/${user._id}#votes/${vote._id}/activity`,
        actor: `${_config.default.url}/users/${user._id}`,
        type: 'Create',
        to: [
            pollOwner.uri
        ],
        published: new Date().toISOString(),
        object: {
            id: `${_config.default.url}/users/${user._id}#votes/${vote._id}`,
            type: 'Note',
            attributedTo: `${_config.default.url}/users/${user._id}`,
            to: [
                pollOwner.uri
            ],
            inReplyTo: pollNote.uri,
            name: pollNote.poll.choices.find((x)=>x.id === vote.choice).text
        }
    };
}

//# sourceMappingURL=vote.js.map
