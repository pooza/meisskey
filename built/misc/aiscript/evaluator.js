"use strict";
Object.defineProperty(exports, "ASEvaluator", {
    enumerable: true,
    get: function() {
        return ASEvaluator;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _seedrandom = require("seedrandom");
const _ = require(".");
const _config = require("../../client/app/config");
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
let ASEvaluator = class ASEvaluator {
    updatePageVar(name, value) {
        const pageVar = this.pageVars.find((v)=>v.name === name);
        if (pageVar !== undefined) {
            pageVar.value = value;
        } else {
            throw new AiScriptError(`No such page var '${name}'`);
        }
    }
    updateRandomSeed(seed) {
        this.opts.randomSeed = seed;
        this.envVars.SEED = seed;
    }
    interpolate(str, scope) {
        return str.replace(/{(.+?)}/g, (match)=>{
            const v = scope.getState(match.slice(1, -1).trim());
            return v == null ? 'NULL' : v.toString();
        });
    }
    evaluateVars() {
        const values = {};
        for (const [k, v] of Object.entries(this.envVars)){
            values[k] = v;
        }
        for (const v of this.pageVars){
            values[v.name] = v.value;
        }
        for (const v of this.variables){
            values[v.name] = this.evaluate(v, new Scope([
                values
            ]));
        }
        return values;
    }
    evaluate(block, scope) {
        if (block.type === null) {
            return null;
        }
        if (block.type === 'number') {
            return parseInt(block.value, 10);
        }
        if (block.type === 'text' || block.type === 'multiLineText') {
            return this.interpolate(block.value || '', scope);
        }
        if (block.type === 'textList') {
            return this.interpolate(block.value || '', scope).trim().split('\n');
        }
        if (block.type === 'ref') {
            return scope.getState(block.value);
        }
        if ((0, _.isFnBlock)(block)) {
            return {
                slots: block.value.slots.map((x)=>x.name),
                exec: (slotArg)=>{
                    return this.evaluate(block.value.expression, scope.createChildScope(slotArg, block.id));
                }
            };
        }
        if (block.type.startsWith('fn:')) {
            const fnName = block.type.split(':')[1];
            const fn = scope.getState(fnName);
            const args = {};
            for(let i = 0; i < fn.slots.length; i++){
                const name = fn.slots[i];
                args[name] = this.evaluate(block.args[i], scope);
            }
            return fn.exec(args);
        }
        if (block.args === undefined) return null;
        const date = new Date();
        const day = `${this.opts.visitor ? this.opts.visitor.id : ''} ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        const funcs = {
            not: (a)=>!a,
            or: (a, b)=>a || b,
            and: (a, b)=>a && b,
            eq: (a, b)=>a === b,
            notEq: (a, b)=>a !== b,
            gt: (a, b)=>a > b,
            lt: (a, b)=>a < b,
            gtEq: (a, b)=>a >= b,
            ltEq: (a, b)=>a <= b,
            if: (bool, a, b)=>bool ? a : b,
            for: (times, fn)=>{
                const result = [];
                for(let i = 0; i < times; i++){
                    result.push(fn.exec({
                        [fn.slots[0]]: i + 1
                    }));
                }
                return result;
            },
            add: (a, b)=>a + b,
            subtract: (a, b)=>a - b,
            multiply: (a, b)=>a * b,
            divide: (a, b)=>a / b,
            mod: (a, b)=>a % b,
            round: (a)=>Math.round(a),
            strLen: (a)=>a.length,
            strPick: (a, b)=>a[b - 1],
            strReplace: (a, b, c)=>a.split(b).join(c),
            strReverse: (a)=>a.split('').reverse().join(''),
            join: (texts, separator)=>texts.join(separator || ''),
            stringToNumber: (a)=>parseInt(a),
            numberToString: (a)=>a.toString(),
            splitStrByLine: (a)=>a.split('\n'),
            pick: (list, i)=>list[i - 1],
            listLen: (list)=>list.length,
            random: (probability)=>Math.floor(_seedrandom(`${this.opts.randomSeed}:${block.id}`)() * 100) < probability,
            rannum: (min, max)=>min + Math.floor(_seedrandom(`${this.opts.randomSeed}:${block.id}`)() * (max - min + 1)),
            randomPick: (list)=>list[Math.floor(_seedrandom(`${this.opts.randomSeed}:${block.id}`)() * list.length)],
            dailyRandom: (probability)=>Math.floor(_seedrandom(`${day}:${block.id}`)() * 100) < probability,
            dailyRannum: (min, max)=>min + Math.floor(_seedrandom(`${day}:${block.id}`)() * (max - min + 1)),
            dailyRandomPick: (list)=>list[Math.floor(_seedrandom(`${day}:${block.id}`)() * list.length)],
            seedRandom: (seed, probability)=>Math.floor(_seedrandom(seed)() * 100) < probability,
            seedRannum: (seed, min, max)=>min + Math.floor(_seedrandom(seed)() * (max - min + 1)),
            seedRandomPick: (seed, list)=>list[Math.floor(_seedrandom(seed)() * list.length)],
            DRPWPM: (list)=>{
                const xs = [];
                let totalFactor = 0;
                for (const x of list){
                    const parts = x.split(' ');
                    const factor = parseInt(parts.pop(), 10);
                    const text = parts.join(' ');
                    totalFactor += factor;
                    xs.push({
                        factor,
                        text
                    });
                }
                const r = _seedrandom(`${day}:${block.id}`)() * totalFactor;
                let stackedFactor = 0;
                for (const x of xs){
                    if (r >= stackedFactor && r <= stackedFactor + x.factor) {
                        return x.text;
                    } else {
                        stackedFactor += x.factor;
                    }
                }
                return xs[0].text;
            }
        };
        const fnName = block.type;
        const fn = funcs[fnName];
        if (fn == null) {
            throw new AiScriptError(`No such function '${fnName}'`);
        } else {
            return fn(...block.args.map((x)=>this.evaluate(x, scope)));
        }
    }
    constructor(variables, pageVars, opts){
        _define_property(this, "variables", void 0);
        _define_property(this, "pageVars", void 0);
        _define_property(this, "envVars", void 0);
        _define_property(this, "opts", void 0);
        this.variables = variables;
        this.pageVars = pageVars;
        this.opts = opts;
        const date = new Date();
        this.envVars = {
            AI: 'kawaii',
            VERSION: _config.version,
            URL: opts.page ? `${opts.url}/@${opts.page.user.username}/pages/${opts.page.name}` : '',
            LOGIN: opts.visitor != null,
            NAME: opts.visitor ? opts.visitor.name || opts.visitor.username : '',
            USERNAME: opts.visitor ? opts.visitor.username : '',
            USERID: opts.visitor ? opts.visitor.id : '',
            NOTES_COUNT: opts.visitor ? opts.visitor.notesCount : 0,
            FOLLOWERS_COUNT: opts.visitor ? opts.visitor.followersCount : 0,
            FOLLOWING_COUNT: opts.visitor ? opts.visitor.followingCount : 0,
            IS_CAT: opts.visitor ? opts.visitor.isCat : false,
            MY_NOTES_COUNT: opts.user ? opts.user.notesCount : 0,
            MY_FOLLOWERS_COUNT: opts.user ? opts.user.followersCount : 0,
            MY_FOLLOWING_COUNT: opts.user ? opts.user.followingCount : 0,
            SEED: opts.randomSeed ? opts.randomSeed : '',
            YMD: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
            YEAR: date.getFullYear(),
            MON: date.getMonth() + 1,
            DAY: date.getDate(),
            HOUR: date.getHours(),
            MIN: date.getMinutes(),
            SEC: date.getSeconds(),
            NULL: null
        };
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], ASEvaluator.prototype, "updatePageVar", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], ASEvaluator.prototype, "updateRandomSeed", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Scope === "undefined" ? Object : Scope
    ])
], ASEvaluator.prototype, "interpolate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], ASEvaluator.prototype, "evaluateVars", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Block === "undefined" ? Object : _.Block,
        typeof Scope === "undefined" ? Object : Scope
    ])
], ASEvaluator.prototype, "evaluate", null);
let AiScriptError = class AiScriptError extends Error {
    constructor(message, info){
        super(message);
        _define_property(this, "info", void 0);
        this.info = info;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AiScriptError);
        }
    }
};
let Scope = class Scope {
    createChildScope(states, name) {
        const layer = [
            states,
            ...this.layerdStates
        ];
        return new Scope(layer, name);
    }
    /**
	 * 指定した名前の変数の値を取得します
	 * @param name 変数名
	 */ getState(name) {
        for (const later of this.layerdStates){
            const state = later[name];
            if (state !== undefined) {
                return state;
            }
        }
        throw new AiScriptError(`No such variable '${name}' in scope '${this.name}'`, {
            scope: this.layerdStates
        });
    }
    constructor(layerdStates, name){
        _define_property(this, "layerdStates", void 0);
        _define_property(this, "name", void 0);
        this.layerdStates = layerdStates;
        this.name = name || 'anonymous';
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Record === "undefined" ? Object : Record,
        Object
    ])
], Scope.prototype, "createChildScope", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], Scope.prototype, "getState", null);

//# sourceMappingURL=evaluator.js.map
