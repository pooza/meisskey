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
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _converthost = require("../../../../../misc/convert-host");
const _mimetypefilter = require("../../../../../misc/mime-type-filter");
const _drivefile = require("../../../../../models/drive-file");
const _emojistore = require("../../../../../services/emoji-store");
const _define = require("../../../define");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: false,
    requireModerator: true,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0
        },
        origin: {
            validator: _cafy.default.optional.str.or([
                'combined',
                'local',
                'remote',
                'system'
            ]),
            default: 'local'
        },
        hostname: {
            validator: _cafy.default.optional.nullable.str,
            default: null
        },
        attached: {
            validator: _cafy.default.optional.str.or([
                'all',
                'attached',
                'notAttached'
            ])
        },
        type: {
            validator: _cafy.default.optional.str.match(_mimetypefilter.typeFilterValidater)
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const q = {
        $and: [
            {}
        ]
    };
    if (ps.hostname != null && ps.hostname.length > 0) {
        q['metadata._user.host'] = (0, _converthost.toDbHost)(ps.hostname);
    } else {
        if (ps.origin === 'system') {
            q['metadata._user.host'] = null;
            const s = await (0, _emojistore.getSystem1)();
            q['metadata.userId'] = s._id;
        } else if (ps.origin === 'local') {
            q['metadata._user.host'] = null;
            const s = await (0, _emojistore.getSystem1)();
            q['metadata.userId'] = {
                $ne: s._id
            };
        } else if (ps.origin === 'remote') {
            q['metadata._user.host'] = {
                $ne: null
            };
        }
    }
    if (ps.attached === 'attached') {
        q.$and.push({
            $or: [
                {
                    'metadata.attachedNoteIds.0': {
                        $exists: true
                    }
                },
                {
                    'metadata.attachedMessageIds.0': {
                        $exists: true
                    }
                },
                {
                    _id: me.avatarId
                },
                {
                    _id: me.bannerId
                }
            ]
        });
    } else if (ps.attached === 'notAttached') {
        q.$and.push({
            $and: [
                {
                    'metadata.attachedNoteIds.0': {
                        $exists: false
                    }
                },
                {
                    'metadata.attachedMessageIds.0': {
                        $exists: false
                    }
                },
                {
                    _id: {
                        $ne: me.avatarId
                    }
                },
                {
                    _id: {
                        $ne: me.bannerId
                    }
                }
            ]
        });
    }
    if (ps.type) {
        q.contentType = (0, _mimetypefilter.genTypeFilterRegex)(ps.type);
    }
    const files = await _drivefile.default.find(q, {
        limit: ps.limit,
        sort: {
            _id: -1
        },
        skip: ps.offset
    });
    return await (0, _drivefile.packMany)(files, {
        detail: true,
        withUser: true,
        self: true
    });
});

//# sourceMappingURL=files.js.map
