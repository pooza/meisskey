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
const _cafyid = require("../../../../../../misc/cafy-id");
const _game = require("../../../../../../models/games/reversi/game");
const _stream = require("../../../../../../services/stream");
const _define = require("../../../../define");
const _error = require("../../../../error");
const meta = {
    tags: [
        'games'
    ],
    desc: {
        'ja-JP': '指定したリバーシの対局で投了します。'
    },
    requireCredential: true,
    params: {
        gameId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '投了したい対局'
            }
        }
    },
    errors: {
        noSuchGame: {
            message: 'No such game.',
            code: 'NO_SUCH_GAME',
            id: 'ace0b11f-e0a6-4076-a30d-e8284c81b2df'
        },
        alreadyEnded: {
            message: 'That game has already ended.',
            code: 'ALREADY_ENDED',
            id: '6c2ad4a6-cbf1-4a5b-b187-b772826cfc6d'
        },
        accessDenied: {
            message: 'Access denied.',
            code: 'ACCESS_DENIED',
            id: '6e04164b-a992-4c93-8489-2123069973e1'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const game = await _game.default.findOne({
        _id: ps.gameId
    });
    if (game == null) {
        throw new _error.ApiError(meta.errors.noSuchGame);
    }
    if (game.isEnded) {
        throw new _error.ApiError(meta.errors.alreadyEnded);
    }
    if (!game.user1Id.equals(user._id) && !game.user2Id.equals(user._id)) {
        throw new _error.ApiError(meta.errors.accessDenied);
    }
    const winnerId = game.user1Id.equals(user._id) ? game.user2Id : game.user1Id;
    await _game.default.update({
        _id: game._id
    }, {
        $set: {
            surrendered: user._id,
            isEnded: true,
            winnerId: winnerId
        }
    });
    (0, _stream.publishReversiGameStream)(game._id, 'ended', {
        winnerId: winnerId,
        game: await (0, _game.pack)(game._id, user)
    });
    return;
});

//# sourceMappingURL=surrender.js.map
