"use strict";
Object.defineProperty(exports, "ASTypeChecker", {
    enumerable: true,
    get: function() {
        return ASTypeChecker;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require(".");
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
let ASTypeChecker = class ASTypeChecker {
    typeCheck(v) {
        if ((0, _.isLiteralBlock)(v)) return null;
        const def = _.funcDefs[v.type];
        if (def == null) {
            throw new Error('Unknown type: ' + v.type);
        }
        const generic = [];
        for(let i = 0; i < def.in.length; i++){
            const arg = def.in[i];
            const type = this.infer(v.args[i]);
            if (type === null) continue;
            if (typeof arg === 'number') {
                if (generic[arg] === undefined) {
                    generic[arg] = type;
                } else if (type !== generic[arg]) {
                    return {
                        arg: i,
                        expect: generic[arg],
                        actual: type
                    };
                }
            } else if (type !== arg) {
                return {
                    arg: i,
                    expect: arg,
                    actual: type
                };
            }
        }
        return null;
    }
    getExpectedType(v, slot) {
        const def = _.funcDefs[v.type];
        if (def == null) {
            throw new Error('Unknown type: ' + v.type);
        }
        const generic = [];
        for(let i = 0; i < def.in.length; i++){
            const arg = def.in[i];
            const type = this.infer(v.args[i]);
            if (type === null) continue;
            if (typeof arg === 'number') {
                if (generic[arg] === undefined) {
                    generic[arg] = type;
                }
            }
        }
        if (typeof def.in[slot] === 'number') {
            return generic[def.in[slot]] || null;
        } else {
            return def.in[slot];
        }
    }
    infer(v) {
        if (v.type === null) return null;
        if (v.type === 'text') return 'string';
        if (v.type === 'multiLineText') return 'string';
        if (v.type === 'textList') return 'stringArray';
        if (v.type === 'number') return 'number';
        if (v.type === 'ref') {
            const variable = this.variables.find((va)=>va.name === v.value);
            if (variable) {
                return this.infer(variable);
            }
            const pageVar = this.pageVars.find((va)=>va.name === v.value);
            if (pageVar) {
                return pageVar.type;
            }
            const envVar = _.envVarsDef[v.value];
            if (envVar !== undefined) {
                return envVar;
            }
            return null;
        }
        if (v.type === 'fn') return null; // todo
        if (v.type.startsWith('fn:')) return null; // todo
        const generic = [];
        const def = _.funcDefs[v.type];
        for(let i = 0; i < def.in.length; i++){
            const arg = def.in[i];
            if (typeof arg === 'number') {
                const type = this.infer(v.args[i]);
                if (generic[arg] === undefined) {
                    generic[arg] = type;
                } else {
                    if (type !== generic[arg]) {
                        generic[arg] = null;
                    }
                }
            }
        }
        if (typeof def.out === 'number') {
            return generic[def.out];
        } else {
            return def.out;
        }
    }
    getVarByName(name) {
        const v = this.variables.find((x)=>x.name === name);
        if (v !== undefined) {
            return v;
        } else {
            throw new Error(`No such variable '${name}'`);
        }
    }
    getVarsByType(type) {
        if (type == null) return this.variables;
        return this.variables.filter((x)=>this.infer(x) === null || this.infer(x) === type);
    }
    getEnvVarsByType(type) {
        if (type == null) return Object.keys(_.envVarsDef);
        return Object.entries(_.envVarsDef).filter(([k, v])=>v === null || type === v).map(([k, v])=>k);
    }
    getPageVarsByType(type) {
        if (type == null) return this.pageVars.map((v)=>v.name);
        return this.pageVars.filter((v)=>type === v.type).map((v)=>v.name);
    }
    isUsedName(name) {
        if (this.variables.some((v)=>v.name === name)) {
            return true;
        }
        if (this.pageVars.some((v)=>v.name === name)) {
            return true;
        }
        if (_.envVarsDef[name]) {
            return true;
        }
        return false;
    }
    constructor(variables = [], pageVars = []){
        _define_property(this, "variables", void 0);
        _define_property(this, "pageVars", void 0);
        this.variables = variables;
        this.pageVars = pageVars;
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Block === "undefined" ? Object : _.Block
    ])
], ASTypeChecker.prototype, "typeCheck", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Block === "undefined" ? Object : _.Block,
        Number
    ])
], ASTypeChecker.prototype, "getExpectedType", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Block === "undefined" ? Object : _.Block
    ])
], ASTypeChecker.prototype, "infer", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], ASTypeChecker.prototype, "getVarByName", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Type === "undefined" ? Object : _.Type
    ])
], ASTypeChecker.prototype, "getVarsByType", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Type === "undefined" ? Object : _.Type
    ])
], ASTypeChecker.prototype, "getEnvVarsByType", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _.Type === "undefined" ? Object : _.Type
    ])
], ASTypeChecker.prototype, "getPageVarsByType", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], ASTypeChecker.prototype, "isUsedName", null);

//# sourceMappingURL=type-checker.js.map
