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
const _define = require("../../define");
const _hashtag = require("../../../../models/hashtag");
const meta = {
    tags: [
        'hashtags'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 600,
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        attachedToUserOnly: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        attachedToLocalUserOnly: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        attachedToRemoteUserOnly: {
            validator: _cafy.default.optional.bool,
            default: false
        },
        sort: {
            validator: _cafy.default.str.or([
                '+mentionedUsers',
                '-mentionedUsers',
                '+mentionedLocalUsers',
                '-mentionedLocalUsers',
                '+mentionedRemoteUsers',
                '-mentionedRemoteUsers',
                '+attachedUsers',
                '-attachedUsers',
                '+attachedLocalUsers',
                '-attachedLocalUsers',
                '+attachedRemoteUsers',
                '-attachedRemoteUsers'
            ])
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Hashtag'
        }
    }
};
const sort = {
    '+mentionedUsers': {
        mentionedUsersCount: -1
    },
    '-mentionedUsers': {
        mentionedUsersCount: 1
    },
    '+mentionedLocalUsers': {
        mentionedLocalUsersCount: -1
    },
    '-mentionedLocalUsers': {
        mentionedLocalUsersCount: 1
    },
    '+mentionedRemoteUsers': {
        mentionedRemoteUsersCount: -1
    },
    '-mentionedRemoteUsers': {
        mentionedRemoteUsersCount: 1
    },
    '+attachedUsers': {
        attachedUsersCount: -1
    },
    '-attachedUsers': {
        attachedUsersCount: 1
    },
    '+attachedLocalUsers': {
        attachedLocalUsersCount: -1
    },
    '-attachedLocalUsers': {
        attachedLocalUsersCount: 1
    },
    '+attachedRemoteUsers': {
        attachedRemoteUsersCount: -1
    },
    '-attachedRemoteUsers': {
        attachedRemoteUsersCount: 1
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const q = {};
    if (ps.attachedToUserOnly) q.attachedUsersCount = {
        $ne: 0
    };
    if (ps.attachedToLocalUserOnly) q.attachedLocalUsersCount = {
        $ne: 0
    };
    if (ps.attachedToRemoteUserOnly) q.attachedRemoteUsersCount = {
        $ne: 0
    };
    const tags = await _hashtag.default.find(q, {
        limit: ps.limit,
        sort: sort[ps.sort],
        fields: {
            tag: true,
            mentionedUsersCount: true,
            mentionedLocalUsersCount: true,
            mentionedRemoteUsersCount: true,
            attachedUsersCount: true,
            attachedLocalUsersCount: true,
            attachedRemoteUsersCount: true
        }
    });
    return tags;
});

//# sourceMappingURL=list.js.map
