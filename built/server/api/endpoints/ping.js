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
const _define = require("../define");
const meta = {
    requireCredential: false,
    tags: [
        'meta'
    ],
    allowGet: true,
    params: {},
    res: {
        type: 'object',
        optional: false,
        nullable: false,
        properties: {
            pong: {
                type: 'number',
                optional: false,
                nullable: false
            }
        }
    }
};
const _default = (0, _define.default)(meta, async ()=>{
    return {
        // なんとなく意図的に誤差を入れる
        pong: Date.now() + Math.floor(Math.random() * 20 - 10)
    };
});

//# sourceMappingURL=ping.js.map
