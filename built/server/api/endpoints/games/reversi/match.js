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
const _matching = require("../../../../../models/games/reversi/matching");
const _game = require("../../../../../models/games/reversi/game");
const _stream = require("../../../../../services/stream");
const _maps = require("../../../../../games/reversi/maps");
const _define = require("../../../define");
const _error = require("../../../error");
const _getters = require("../../../common/getters");
const meta = {
    tags: [
        'games'
    ],
    requireCredential: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '0b4f0559-b484-4e31-9581-3f73cee89b28'
        },
        isYourself: {
            message: 'Target user is yourself.',
            code: 'TARGET_IS_YOURSELF',
            id: '96fd7bd6-d2bc-426c-a865-d055dcd2828e'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Myself
    if (ps.userId.equals(user._id)) {
        throw new _error.ApiError(meta.errors.isYourself);
    }
    // Find session
    const exist = await _matching.default.findOne({
        parentId: ps.userId,
        childId: user._id
    });
    if (exist) {
        // Destroy session
        _matching.default.remove({
            _id: exist._id
        });
        // Create game
        const game = await _game.default.insert({
            createdAt: new Date(),
            user1Id: exist.parentId,
            user2Id: user._id,
            user1Accepted: false,
            user2Accepted: false,
            isStarted: false,
            isEnded: false,
            logs: [],
            settings: {
                map: _maps.eighteight.data,
                bw: 'random',
                isLlotheo: false
            }
        });
        (0, _stream.publishReversiStream)(exist.parentId, 'matched', await (0, _game.pack)(game, exist.parentId));
        const other = await _matching.default.count({
            childId: user._id
        });
        if (other == 0) {
            (0, _stream.publishMainStream)(user._id, 'reversiNoInvites');
        }
        return await (0, _game.pack)(game, user);
    } else {
        // Fetch child
        const child = await (0, _getters.getUser)(ps.userId).catch((e)=>{
            if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
            throw e;
        });
        // 以前のセッションはすべて削除しておく
        await _matching.default.remove({
            parentId: user._id
        });
        // セッションを作成
        const matching = await _matching.default.insert({
            createdAt: new Date(),
            parentId: user._id,
            childId: child._id
        });
        const packed = await (0, _matching.pack)(matching, child);
        (0, _stream.publishReversiStream)(child._id, 'invited', packed);
        (0, _stream.publishMainStream)(child._id, 'reversiInvited', packed);
        return;
    }
});

//# sourceMappingURL=match.js.map
