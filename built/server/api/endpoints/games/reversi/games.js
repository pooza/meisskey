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
const _cafyid = require("../../../../../misc/cafy-id");
const _game = require("../../../../../models/games/reversi/game");
const _define = require("../../../define");
const meta = {
    tags: [
        'games'
    ],
    params: {
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10
        },
        sinceId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        untilId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform
        },
        my: {
            validator: _cafy.default.optional.bool,
            default: false
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const q = ps.my ? {
        isStarted: true,
        $or: [
            {
                user1Id: user._id
            },
            {
                user2Id: user._id
            }
        ]
    } : {
        isStarted: true
    };
    const sort = {
        _id: -1
    };
    if (ps.sinceId) {
        sort._id = 1;
        q._id = {
            $gt: ps.sinceId
        };
    } else if (ps.untilId) {
        q._id = {
            $lt: ps.untilId
        };
    }
    // Fetch games
    const games = await _game.default.find(q, {
        sort: sort,
        limit: ps.limit
    });
    return await Promise.all(games.map((g)=>(0, _game.pack)(g, user, {
            detail: false
        })));
});

//# sourceMappingURL=games.js.map
