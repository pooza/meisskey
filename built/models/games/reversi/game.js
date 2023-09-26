"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../../../db/mongodb");
const _isobjectid = require("../../../misc/is-objectid");
const _user = require("../../user");
const ReversiGame = _mongodb1.default.get('reversiGames');
const _default = ReversiGame;
const pack = (game, me, options)=>new Promise(async (resolve, reject)=>{
        const opts = Object.assign({
            detail: true
        }, options);
        let _game;
        // Populate the game if 'game' is ID
        if ((0, _isobjectid.default)(game)) {
            _game = await ReversiGame.findOne({
                _id: game
            });
        } else if (typeof game === 'string') {
            _game = await ReversiGame.findOne({
                _id: new _mongodb.ObjectID(game)
            });
        } else {
            _game = _deepcopy(game);
        }
        // Me
        const meId = me ? (0, _isobjectid.default)(me) ? me : typeof me === 'string' ? new _mongodb.ObjectID(me) : me._id : null;
        // Rename _id to id
        _game.id = _game._id;
        delete _game._id;
        if (opts.detail === false) {
            delete _game.logs;
            delete _game.settings.map;
        } else {
            // 互換性のため
            if (_game.settings.map.hasOwnProperty('size')) {
                _game.settings.map = _game.settings.map.data.match(new RegExp(`.{1,${_game.settings.map.size}}`, 'g'));
            }
        }
        // v11 compatible
        _game.map = _game.settings.map;
        _game.bw = _game.settings.bw;
        _game.isLlotheo = _game.settings.isLlotheo;
        _game.canPutEverywhere = _game.settings.canPutEverywhere;
        _game.loopedBoard = _game.settings.loopedBoard;
        // Populate user
        _game.user1 = await (0, _user.pack)(_game.user1Id, meId);
        _game.user2 = await (0, _user.pack)(_game.user2Id, meId);
        if (_game.winnerId) {
            _game.winner = await (0, _user.pack)(_game.winnerId, meId);
        } else {
            _game.winner = null;
        }
        resolve(_game);
    });

//# sourceMappingURL=game.js.map
