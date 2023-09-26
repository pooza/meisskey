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
const _cafyid = require("../../../../misc/cafy-id");
const _blocking = require("../../../../models/blocking");
const _define = require("../../define");
const _user = require("../../../../models/user");
const meta = {
    desc: {
        'ja-JP': 'ブロックしているユーザー一覧を取得します。',
        'en-US': 'Get blocking users.'
    },
    tags: [
        'account'
    ],
    requireCredential: true,
    kind: [
        'read:blocks',
        'read:following',
        'following-read'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 30
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'Blocking'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const suspended = await _user.default.find({
        $or: [
            {
                isSuspended: true
            },
            {
                isDeleted: true
            }
        ]
    }, {
        fields: {
            _id: true
        }
    });
    const query = {
        blockerId: me._id,
        blockeeId: {
            $nin: suspended.map((x)=>x._id)
        }
    };
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        query._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        query._id = {
            $lt: ps.untilId
        };
    }
    const blockings = await _blocking.default.find(query, {
        limit: ps.limit,
        sort: sort
    });
    return await (0, _blocking.packMany)(blockings, me);
});

//# sourceMappingURL=list.js.map
