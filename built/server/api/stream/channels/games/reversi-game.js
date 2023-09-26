"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _class;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _crc32 = require("crc-32");
const _mongodb = require("mongodb");
const _game = require("../../../../../models/games/reversi/game");
const _stream = require("../../../../../services/stream");
const _core = require("../../../../../games/reversi/core");
const _maps = require("../../../../../games/reversi/maps");
const _channel = require("../../channel");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let _class = class _class extends _channel.default {
    async init(params) {
        this.gameId = new _mongodb.ObjectID(params.gameId);
        // Subscribe game stream
        this.subscriber.on(`reversiGameStream:${this.gameId}`, (data)=>{
            this.send(data);
        });
    }
    onMessage(type, body) {
        switch(type){
            case 'accept':
                this.accept(true);
                break;
            case 'cancelAccept':
                this.accept(false);
                break;
            case 'updateSettings':
                this.updateSettings(body.settings);
                break;
            case 'initForm':
                this.initForm(body);
                break;
            case 'updateForm':
                this.updateForm(body.id, body.value);
                break;
            case 'message':
                this.message(body);
                break;
            case 'set':
                this.set(body.pos);
                break;
            case 'check':
                this.check(body.crc32);
                break;
        }
    }
    async updateSettings(settings) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (game.isStarted) return;
        if (!game.user1Id.equals(this.user._id) && !game.user2Id.equals(this.user._id)) return;
        if (game.user1Id.equals(this.user._id) && game.user1Accepted) return;
        if (game.user2Id.equals(this.user._id) && game.user2Accepted) return;
        await _game.default.update({
            _id: this.gameId
        }, {
            $set: {
                settings
            }
        });
        (0, _stream.publishReversiGameStream)(this.gameId, 'updateSettings', settings);
    }
    async initForm(form) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (game.isStarted) return;
        if (!game.user1Id.equals(this.user._id) && !game.user2Id.equals(this.user._id)) return;
        const set = game.user1Id.equals(this.user._id) ? {
            form1: form
        } : {
            form2: form
        };
        await _game.default.update({
            _id: this.gameId
        }, {
            $set: set
        });
        (0, _stream.publishReversiGameStream)(this.gameId, 'initForm', {
            userId: this.user._id,
            form
        });
    }
    async updateForm(id, value) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (game.isStarted) return;
        if (!game.user1Id.equals(this.user._id) && !game.user2Id.equals(this.user._id)) return;
        const form = game.user1Id.equals(this.user._id) ? game.form2 : game.form1;
        const item = form.find((i)=>i.id == id);
        if (item == null) return;
        item.value = value;
        const set = game.user1Id.equals(this.user._id) ? {
            form2: form
        } : {
            form1: form
        };
        await _game.default.update({
            _id: this.gameId
        }, {
            $set: set
        });
        (0, _stream.publishReversiGameStream)(this.gameId, 'updateForm', {
            userId: this.user._id,
            id,
            value
        });
    }
    async message(message) {
        message.id = Math.random();
        (0, _stream.publishReversiGameStream)(this.gameId, 'message', {
            userId: this.user._id,
            message
        });
    }
    async accept(accept) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (game.isStarted) return;
        let bothAccepted = false;
        if (game.user1Id.equals(this.user._id)) {
            await _game.default.update({
                _id: this.gameId
            }, {
                $set: {
                    user1Accepted: accept
                }
            });
            (0, _stream.publishReversiGameStream)(this.gameId, 'changeAccepts', {
                user1: accept,
                user2: game.user2Accepted
            });
            if (accept && game.user2Accepted) bothAccepted = true;
        } else if (game.user2Id.equals(this.user._id)) {
            await _game.default.update({
                _id: this.gameId
            }, {
                $set: {
                    user2Accepted: accept
                }
            });
            (0, _stream.publishReversiGameStream)(this.gameId, 'changeAccepts', {
                user1: game.user1Accepted,
                user2: accept
            });
            if (accept && game.user1Accepted) bothAccepted = true;
        } else {
            return;
        }
        if (bothAccepted) {
            // 3秒後、まだacceptされていたらゲーム開始
            setTimeout(async ()=>{
                const freshGame = await _game.default.findOne({
                    _id: this.gameId
                });
                if (freshGame == null || freshGame.isStarted || freshGame.isEnded) return;
                if (!freshGame.user1Accepted || !freshGame.user2Accepted) return;
                let bw;
                if (freshGame.settings.bw == 'random') {
                    bw = Math.random() > 0.5 ? 1 : 2;
                } else {
                    bw = freshGame.settings.bw;
                }
                function getRandomMap() {
                    const mapCount = Object.entries(_maps).length;
                    const rnd = Math.floor(Math.random() * mapCount);
                    return Object.values(_maps)[rnd].data;
                }
                const map = freshGame.settings.map != null ? freshGame.settings.map : getRandomMap();
                await _game.default.update({
                    _id: this.gameId
                }, {
                    $set: {
                        startedAt: new Date(),
                        isStarted: true,
                        black: bw,
                        'settings.map': map
                    }
                });
                //#region 盤面に最初から石がないなどして始まった瞬間に勝敗が決定する場合があるのでその処理
                const o = new _core.default(map, {
                    isLlotheo: freshGame.settings.isLlotheo,
                    canPutEverywhere: freshGame.settings.canPutEverywhere,
                    loopedBoard: freshGame.settings.loopedBoard
                });
                if (o.isEnded) {
                    let winner;
                    if (o.winner === true) {
                        winner = freshGame.black == 1 ? freshGame.user1Id : freshGame.user2Id;
                    } else if (o.winner === false) {
                        winner = freshGame.black == 1 ? freshGame.user2Id : freshGame.user1Id;
                    } else {
                        winner = null;
                    }
                    await _game.default.update({
                        _id: this.gameId
                    }, {
                        $set: {
                            isEnded: true,
                            winnerId: winner
                        }
                    });
                    (0, _stream.publishReversiGameStream)(this.gameId, 'ended', {
                        winnerId: winner,
                        game: await (0, _game.pack)(this.gameId, this.user)
                    });
                }
                //#endregion
                (0, _stream.publishReversiGameStream)(this.gameId, 'started', await (0, _game.pack)(this.gameId, this.user));
            }, 3000);
        }
    }
    // 石を打つ
    async set(pos) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (!game.isStarted) return;
        if (game.isEnded) return;
        if (!game.user1Id.equals(this.user._id) && !game.user2Id.equals(this.user._id)) return;
        const o = new _core.default(game.settings.map, {
            isLlotheo: game.settings.isLlotheo,
            canPutEverywhere: game.settings.canPutEverywhere,
            loopedBoard: game.settings.loopedBoard
        });
        for (const log of game.logs){
            o.put(log.color, log.pos);
        }
        const myColor = game.user1Id.equals(this.user._id) && game.black == 1 || game.user2Id.equals(this.user._id) && game.black == 2 ? true : false;
        if (!o.canPut(myColor, pos)) return;
        o.put(myColor, pos);
        let winner;
        if (o.isEnded) {
            if (o.winner === true) {
                winner = game.black == 1 ? game.user1Id : game.user2Id;
            } else if (o.winner === false) {
                winner = game.black == 1 ? game.user2Id : game.user1Id;
            } else {
                winner = null;
            }
        }
        const log = {
            at: new Date(),
            color: myColor,
            pos
        };
        const crc32 = _crc32.str(game.logs.map((x)=>x.pos.toString()).join('') + pos.toString());
        await _game.default.update({
            _id: this.gameId
        }, {
            $set: {
                crc32,
                isEnded: o.isEnded,
                winnerId: winner
            },
            $push: {
                logs: log
            }
        });
        (0, _stream.publishReversiGameStream)(this.gameId, 'set', Object.assign(log, {
            next: o.turn
        }));
        if (o.isEnded) {
            (0, _stream.publishReversiGameStream)(this.gameId, 'ended', {
                winnerId: winner,
                game: await (0, _game.pack)(this.gameId, this.user)
            });
        }
    }
    async check(crc32) {
        const game = await _game.default.findOne({
            _id: this.gameId
        });
        if (!game.isStarted) return;
        // 互換性のため
        if (game.crc32 == null) return;
        if (crc32 !== game.crc32) {
            this.send('rescue', await (0, _game.pack)(game, this.user));
        }
    }
    constructor(...args){
        super(...args);
        _define_property(this, "chName", 'gamesReversiGame');
        _define_property(this, "gameId", void 0);
    }
};
_define_property(_class, "requireCredential", false);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "init", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], _class.prototype, "onMessage", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "updateSettings", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "initForm", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], _class.prototype, "updateForm", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], _class.prototype, "message", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean
    ])
], _class.prototype, "accept", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ])
], _class.prototype, "set", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], _class.prototype, "check", null);

//# sourceMappingURL=reversi-game.js.map
