"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const Hashtag = _mongodb.default.get('hashtags');
Hashtag.createIndex('tag', {
    unique: true
});
Hashtag.createIndex('mentionedUsersCount');
Hashtag.createIndex('mentionedLocalUsersCount');
Hashtag.createIndex('mentionedRemoteUsersCount');
Hashtag.createIndex('attachedUsersCount');
Hashtag.createIndex('attachedLocalUsersCount');
Hashtag.createIndex('attachedRemoteUsersCount');
const _default = Hashtag;
// 後方互換性のため
Hashtag.findOne({
    attachedUserIds: {
        $exists: false
    }
}).then((h)=>{
    if (h != null) {
        Hashtag.update({}, {
            $rename: {
                mentionedUserIdsCount: 'mentionedUsersCount'
            },
            $set: {
                mentionedLocalUserIds: [],
                mentionedLocalUsersCount: 0,
                attachedUserIds: [],
                attachedUsersCount: 0,
                attachedLocalUserIds: [],
                attachedLocalUsersCount: 0
            }
        }, {
            multi: true
        });
    }
});
Hashtag.findOne({
    attachedRemoteUserIds: {
        $exists: false
    }
}).then((h)=>{
    if (h != null) {
        Hashtag.update({}, {
            $set: {
                mentionedRemoteUserIds: [],
                mentionedRemoteUsersCount: 0,
                attachedRemoteUserIds: [],
                attachedRemoteUsersCount: 0
            }
        }, {
            multi: true
        });
    }
});

//# sourceMappingURL=hashtag.js.map
