"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return ID;
    },
    transform: function() {
        return transform;
    },
    transformMany: function() {
        return transformMany;
    }
});
const _mongodb = require("mongodb");
const _cafy = require("cafy");
const _isobjectid = require("./is-objectid");
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
/**
 * ObjectIDまたはObjectIDに変換可能なstringか
 */ const isValidId = (x)=>_mongodb.ObjectID.isValid(x);
const transform = (x)=>{
    if (x === undefined) return undefined;
    if (x === null) return null;
    if (isValidId(x) && !(0, _isobjectid.default)(x)) {
        return new _mongodb.ObjectID(x);
    } else {
        return x;
    }
};
const transformMany = (xs)=>{
    if (xs == null) return null;
    return xs.map((x)=>transform(x));
};
let ID = class ID extends _cafy.Context {
    getType() {
        return super.getType('String');
    }
    makeOptional() {
        return new ID(true, false);
    }
    makeNullable() {
        return new ID(false, true);
    }
    makeOptionalNullable() {
        return new ID(true, true);
    }
    constructor(optional = false, nullable = false){
        super(optional, nullable);
        _define_property(this, "name", 'ID');
        this.push((v)=>{
            if (!(0, _isobjectid.default)(v) && !isValidId(v)) {
                return new Error('must-be-an-id');
            }
            return true;
        });
    }
};

//# sourceMappingURL=cafy-id.js.map
