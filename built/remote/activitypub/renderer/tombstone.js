"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _default = (id, formerType)=>{
    const object = {
        id,
        type: 'Tombstone'
    };
    if (formerType) object.formerType = formerType;
    return object;
};

//# sourceMappingURL=tombstone.js.map
