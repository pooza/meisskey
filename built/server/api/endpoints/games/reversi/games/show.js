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
const _core = require("../../../../../../games/reversi/core");
const _define = require("../../../../define");
const _error = require("../../../../error");
const meta = {
    tags: [
        'games'
    ],
    params: {
        gameId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    errors: {
        noSuchGame: {
            message: 'No such game.',
            code: 'NO_SUCH_GAME',
            id: 'f13a03db-fae1-46c9-87f3-43c8165419e1'
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
    const o = new _core.default(game.settings.map, {
        isLlotheo: game.settings.isLlotheo,
        canPutEverywhere: game.settings.canPutEverywhere,
        loopedBoard: game.settings.loopedBoard
    });
    for (const log of game.logs)o.put(log.color, log.pos);
    const packed = await (0, _game.pack)(game, user);
    return Object.assign({
        board: o.board,
        turn: o.turn
    }, packed);
});

//# sourceMappingURL=show.js.map
