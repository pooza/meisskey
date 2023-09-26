"use strict";
Object.defineProperty(exports, "findJoinedNotes", {
    enumerable: true,
    get: function() {
        return findJoinedNotes;
    }
});
const _note = require("../../../models/note");
async function findJoinedNotes(query, sort, limit, maxTimeMS = 60000) {
    const notes = await _note.default.aggregate([
        {
            $match: query
        },
        {
            $sort: sort
        },
        {
            $limit: limit
        },
        {
            // join User
            $lookup: {
                from: 'users',
                let: {
                    userId: '$userId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    '$_id',
                                    '$$userId'
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            name: true,
                            username: true,
                            host: true,
                            avatarColor: true,
                            avatarId: true,
                            bannerId: true,
                            emojis: true,
                            avoidSearchIndex: true,
                            isExplorable: true,
                            hideFollows: true,
                            isCat: true,
                            isBot: true,
                            isOrganization: true,
                            isGroup: true,
                            isAdmin: true,
                            isVerified: true
                        }
                    }
                ],
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ], {
        maxTimeMS
    });
    return notes;
}

//# sourceMappingURL=find-joined-notes.js.map
