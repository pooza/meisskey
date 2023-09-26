"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    // これは指定期間のをスコアが高い順にリストするが
    // クライアントではこれを日付順にソートしている
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _note = require("../../../../models/note");
const _define = require("../../define");
const _gethideusers = require("../../common/get-hide-users");
const _fetchmeta = require("../../../../misc/fetch-meta");
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
const meta = {
    desc: {
        'ja-JP': 'Featuredな投稿を取得します。',
        'en-US': 'Get featured notes.'
    },
    tags: [
        'notes'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 600,
    params: {
        minScore: {
            validator: _cafy.default.optional.num.range(0, 100),
            default: 5,
            desc: {
                'ja-JP': '最低スコア'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(0, 100),
            default: 10,
            desc: {
                'ja-JP': '最大数'
            }
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0,
            desc: {
                'ja-JP': 'オフセット'
            }
        },
        fileType: {
            validator: _cafy.default.optional.arr(_cafy.default.str),
            desc: {
                'ja-JP': '指定された種類のファイルが添付された投稿のみを取得します'
            }
        },
        excludeNsfw: {
            validator: _cafy.default.optional.boolean,
            default: false,
            desc: {
                'ja-JP': 'true にするとNSFWを除外します'
            }
        },
        excludeSfw: {
            validator: _cafy.default.optional.boolean,
            default: false,
            desc: {
                'ja-JP': 'NSFWのみ'
            }
        },
        includeGlobal: {
            validator: _cafy.default.optional.boolean,
            default: false,
            desc: {
                'ja-JP': 'true にすると連合を含めます'
            }
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Note'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const m = await (0, _fetchmeta.default)();
    if (!user && m.disableTimelinePreview) {
        return [];
    }
    if (ps.excludeNsfw && ps.excludeSfw) return [];
    const hideUserIds = await (0, _gethideusers.getHideUserIds)(user);
    const query = _object_spread({
        deletedAt: null,
        visibility: 'public',
        score: {
            $gte: ps.minScore
        },
        localOnly: {
            $ne: true
        }
    }, hideUserIds && hideUserIds.length > 0 ? {
        userId: {
            $nin: hideUserIds
        }
    } : {});
    if (!ps.includeGlobal) {
        query['_user.host'] = null;
    }
    if (ps.excludeNsfw) {
        query['_files.metadata.isSensitive'] = {
            $ne: true
        };
        query['cw'] = null;
    }
    if (ps.excludeSfw) {
        query['_files.metadata.isSensitive'] = true;
    }
    if (ps.fileType) {
        query.fileIds = {
            $exists: true,
            $ne: []
        };
        query['_files.contentType'] = {
            $in: ps.fileType
        };
    }
    const notes = await _note.default.find(query, {
        maxTimeMS: 20000,
        limit: ps.limit,
        skip: ps.offset,
        sort: {
            _id: -1
        }
    });
    return await (0, _note.packMany)(notes, user);
});

//# sourceMappingURL=featured.js.map
