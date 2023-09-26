"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Reversi;
    }
});
const _array = require("../../prelude/array");
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
// MISSKEY REVERSI ENGINE
/** 先手 黒 */ const BLACK = true;
/** 後手 白 */ const WHITE = false;
/** 勝者 未確定 */ const WINNER_UNDECIDED = undefined;
/** 勝者 引き分け */ const WINNER_EVEN = null;
const GAME_FINISHED = null;
let Reversi = class Reversi {
    /**
	 * 黒石の数
	 */ get blackCount() {
        return (0, _array.count)(BLACK, this.board);
    }
    /**
	 * 白石の数
	 */ get whiteCount() {
        return (0, _array.count)(WHITE, this.board);
    }
    transformPosToXy(pos) {
        const x = pos % this.mapWidth;
        const y = Math.floor(pos / this.mapWidth);
        return [
            x,
            y
        ];
    }
    transformXyToPos(x, y) {
        return x + y * this.mapWidth;
    }
    /**
	 * 指定のマスに石を打ちます
	 * @param color 石の色
	 * @param pos 位置
	 */ put(color, pos) {
        this.prevPos = pos;
        this.prevColor = color;
        this.board[pos] = color;
        // 反転させられる石を取得
        const effects = this.effects(color, pos);
        // 反転させる
        for (const pos of effects){
            this.board[pos] = color;
        }
        const turn = this.turn;
        this.logs.push({
            color,
            pos,
            effects,
            turn
        });
        this.calcTurn();
    }
    calcTurn() {
        // ターン計算
        this.turn = this.canPutSomewhere(!this.prevColor) ? !this.prevColor : this.canPutSomewhere(this.prevColor) ? this.prevColor : GAME_FINISHED;
    }
    undo() {
        const undo = this.logs.pop();
        this.prevColor = undo.color;
        this.prevPos = undo.pos;
        this.board[undo.pos] = null;
        for (const pos of undo.effects){
            const color = this.board[pos];
            this.board[pos] = !color;
        }
        this.turn = undo.turn;
    }
    /**
	 * 指定した位置のマップデータのマスを取得します
	 * @param pos 位置
	 */ mapDataGet(pos) {
        const [x, y] = this.transformPosToXy(pos);
        return x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight ? 'null' : this.map[pos];
    }
    /**
	 * 打つことができる場所を取得します
	 */ puttablePlaces(color) {
        return Array.from(this.board.keys()).filter((i)=>this.canPut(color, i));
    }
    /**
	 * 打つことができる場所があるかどうかを取得します
	 */ canPutSomewhere(color) {
        return this.puttablePlaces(color).length > 0;
    }
    /**
	 * 指定のマスに石を打つことができるかどうかを取得します
	 * @param color 自分の色
	 * @param pos 位置
	 */ canPut(color, pos) {
        return this.board[pos] !== null ? false : this.opts.canPutEverywhere ? this.mapDataGet(pos) == 'empty' : this.effects(color, pos).length !== 0; // 相手の石を1つでも反転させられるか
    }
    /**
	 * 指定のマスに石を置いた時の、反転させられる石を取得します
	 * @param color 自分の色
	 * @param initPos 位置
	 */ effects(color, initPos) {
        const enemyColor = !color;
        const diffVectors = [
            [
                0,
                -1
            ],
            [
                +1,
                -1
            ],
            [
                +1,
                0
            ],
            [
                +1,
                +1
            ],
            [
                0,
                +1
            ],
            [
                -1,
                +1
            ],
            [
                -1,
                0
            ],
            [
                -1,
                -1
            ] // 左上
        ];
        const effectsInLine = ([dx, dy])=>{
            const nextPos = (x, y)=>[
                    x + dx,
                    y + dy
                ];
            const found = []; // 挟めるかもしれない相手の石を入れておく配列
            let [x, y] = this.transformPosToXy(initPos);
            while(true){
                [x, y] = nextPos(x, y);
                // 座標が指し示す位置がボード外に出たとき
                if (this.opts.loopedBoard && this.transformXyToPos(x = (x % this.mapWidth + this.mapWidth) % this.mapWidth, y = (y % this.mapHeight + this.mapHeight) % this.mapHeight) == initPos) // 盤面の境界でループし、自分が石を置く位置に戻ってきたとき、挟めるようにしている (ref: Test4のマップ)
                return found;
                else if (x == -1 || y == -1 || x == this.mapWidth || y == this.mapHeight) return []; // 挟めないことが確定 (盤面外に到達)
                const pos = this.transformXyToPos(x, y);
                if (this.mapDataGet(pos) === 'null') return []; // 挟めないことが確定 (配置不可能なマスに到達)
                const stone = this.board[pos];
                if (stone === null) return []; // 挟めないことが確定 (石が置かれていないマスに到達)
                if (stone === enemyColor) found.push(pos); // 挟めるかもしれない (相手の石を発見)
                if (stone === color) return found; // 挟めることが確定 (対となる自分の石を発見)
            }
        };
        return (0, _array.concat)(diffVectors.map(effectsInLine));
    }
    /**
	 * ゲームが終了したか否か
	 */ get isEnded() {
        return this.turn === GAME_FINISHED;
    }
    /**
	 * ゲームの勝者
	 */ get winner() {
        if (!this.isEnded) {
            return WINNER_UNDECIDED;
        } else if (this.blackCount > this.whiteCount) {
            return this.xor(BLACK, this.opts.isLlotheo);
        } else if (this.blackCount < this.whiteCount) {
            return this.xor(WHITE, this.opts.isLlotheo);
        } else {
            return WINNER_EVEN;
        }
    }
    xor(a, b) {
        return (a || b) && !(a && b);
    }
    /**
	 * ゲームを初期化します
	 */ constructor(map, opts){
        _define_property(this, "map", void 0);
        _define_property(this, "mapWidth", void 0);
        _define_property(this, "mapHeight", void 0);
        _define_property(this, "board", void 0);
        _define_property(this, "turn", BLACK);
        _define_property(this, "opts", void 0);
        _define_property(this, "prevPos", -1);
        _define_property(this, "prevColor", null);
        _define_property(this, "logs", []);
        //#region binds
        this.put = this.put.bind(this);
        //#endregion
        //#region Options
        this.opts = opts;
        if (this.opts.isLlotheo == null) this.opts.isLlotheo = false;
        if (this.opts.canPutEverywhere == null) this.opts.canPutEverywhere = false;
        if (this.opts.loopedBoard == null) this.opts.loopedBoard = false;
        //#endregion
        //#region Parse map data
        this.mapWidth = map[0].length;
        this.mapHeight = map.length;
        const mapData = map.join('');
        this.board = mapData.split('').map((d)=>d === '-' ? null : d === 'b' ? BLACK : d === 'w' ? WHITE : undefined);
        this.map = mapData.split('').map((d)=>d === '-' || d === 'b' || d === 'w' ? 'empty' : 'null');
        //#endregion
        // ゲームが始まった時点で片方の色の石しかないか、始まった時点で勝敗が決定するようなマップの場合がある
        if (!this.canPutSomewhere(BLACK)) {
            if (this.canPutSomewhere(WHITE)) {
                this.turn = WHITE;
            } else {
                this.turn = GAME_FINISHED;
            }
        }
    }
};

//# sourceMappingURL=core.js.map
