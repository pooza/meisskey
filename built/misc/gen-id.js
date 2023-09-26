"use strict";
Object.defineProperty(exports, "genId", {
    enumerable: true,
    get: function() {
        return genId;
    }
});
const _meid7 = require("./id/meid7");
const method = 'meid7';
function genId(date) {
    if (!date || date > new Date()) date = new Date();
    switch(method){
        case 'meid7':
            return (0, _meid7.genMeid7)(date);
        default:
            throw new Error('unknown id generation method');
    }
}

//# sourceMappingURL=gen-id.js.map
