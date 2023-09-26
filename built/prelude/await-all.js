"use strict";
Object.defineProperty(exports, "awaitAll", {
    enumerable: true,
    get: function() {
        return awaitAll;
    }
});
async function awaitAll(obj) {
    const target = {};
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    const resolvedValues = await Promise.all(values.map((value)=>!value || !value.constructor || value.constructor.name !== 'Object' ? value : awaitAll(value)));
    for(let i = 0; i < keys.length; i++){
        target[keys[i]] = resolvedValues[i];
    }
    return target;
}

//# sourceMappingURL=await-all.js.map
