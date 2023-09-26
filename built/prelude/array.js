"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    countIf: function() {
        return countIf;
    },
    count: function() {
        return count;
    },
    concat: function() {
        return concat;
    },
    removeNull: function() {
        return removeNull;
    },
    erase: function() {
        return erase;
    },
    unique: function() {
        return unique;
    },
    sum: function() {
        return sum;
    },
    maximum: function() {
        return maximum;
    },
    groupBy: function() {
        return groupBy;
    },
    lessThan: function() {
        return lessThan;
    },
    fromEntries: function() {
        return fromEntries;
    },
    toArray: function() {
        return toArray;
    },
    toSingle: function() {
        return toSingle;
    }
});
function countIf(f, xs) {
    return xs.filter(f).length;
}
function count(a, xs) {
    return countIf((x)=>x === a, xs);
}
function concat(xss) {
    return [].concat(...xss);
}
function removeNull(src) {
    return src.filter((x)=>x != null);
}
function erase(a, xs) {
    return xs.filter((x)=>x !== a);
}
function unique(xs) {
    return [
        ...new Set(xs)
    ];
}
function sum(xs) {
    return xs.reduce((a, b)=>a + b, 0);
}
function maximum(xs) {
    return Math.max(...xs);
}
function groupBy(collections, keySerector) {
    return collections.reduce((obj, item)=>{
        const key = keySerector(item);
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = [];
        }
        obj[key].push(item);
        return obj;
    }, {});
}
function lessThan(xs, ys) {
    for(let i = 0; i < Math.min(xs.length, ys.length); i++){
        if (xs[i] < ys[i]) return true;
        if (xs[i] > ys[i]) return false;
    }
    return xs.length < ys.length;
}
function fromEntries(xs) {
    return xs.reduce((obj, [k, v])=>Object.assign(obj, {
            [k]: v
        }), {});
}
function toArray(x) {
    return Array.isArray(x) ? x : x != null ? [
        x
    ] : [];
}
function toSingle(x) {
    return Array.isArray(x) ? x[0] : x;
}

//# sourceMappingURL=array.js.map
