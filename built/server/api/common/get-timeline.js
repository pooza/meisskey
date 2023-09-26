"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getPackedTimeline: function() {
        return getPackedTimeline;
    },
    explainTimeline: function() {
        return explainTimeline;
    }
});
const _mongodb = require("mongodb");
const _note = require("../../../models/note");
const _logger = require("../logger");
const _perf_hooks = require("perf_hooks");
const _meid7 = require("../../../misc/id/meid7");
function getStages(query, sort, limit) {
    return [
        {
            $match: {
                $and: [
                    query,
                    {
                        'fileIds.100': {
                            $exists: false
                        }
                    }
                ]
            }
        },
        {
            $sort: sort
        },
        {
            $limit: limit
        },
        {
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
                            avatarId: true,
                            emojis: true,
                            isCat: true,
                            isBot: true,
                            isAdmin: true,
                            isVerified: true,
                            borderColor: true,
                            tags: true
                        } // $project in pipeline
                    }
                ],
                as: '__user'
            } // $lookup
        },
        {
            $unwind: {
                path: '$__user'
            }
        }
    ];
}
async function getPackedTimeline(me, query, sort, limit, hint = undefined) {
    var _query_createdAt, _query_createdAt1;
    if ((_query_createdAt = query.createdAt) === null || _query_createdAt === void 0 ? void 0 : _query_createdAt.$gt) {
        const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(query.createdAt.$gt));
        delete query.createdAt.$gt;
        delete query.createdAt;
        query._id = {
            $gt: id
        };
    }
    if ((_query_createdAt1 = query.createdAt) === null || _query_createdAt1 === void 0 ? void 0 : _query_createdAt1.$lt) {
        const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(query.createdAt.$lt));
        delete query.createdAt.$lt;
        delete query.createdAt;
        query._id = {
            $lt: id
        };
    }
    const begin = _perf_hooks.performance.now();
    // Query
    const timeline = await _note.default.aggregate(getStages(query, sort, limit), {
        maxTimeMS: 55000,
        hint
    });
    const queryEnd = _perf_hooks.performance.now();
    // Pack
    const packed = await (0, _note.packMany)(timeline, me);
    const packEnd = _perf_hooks.performance.now();
    if (queryEnd - begin > 1000) {
        _logger.apiLogger.warn(`SLOWTL: query=${(queryEnd - begin).toFixed()}, pack=${(packEnd - queryEnd).toFixed()}`);
    }
    return packed;
}
async function explainTimeline(me, query, sort, limit, hint = undefined) {
    return await _note.default.aggregate(getStages(query, sort, limit), {
        explain: true,
        hint
    });
}

//# sourceMappingURL=get-timeline.js.map
