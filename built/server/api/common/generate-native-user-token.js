"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _securerndstr = require("../../../misc/secure-rndstr");
const _default = ()=>`!${(0, _securerndstr.secureRndstr)(32, true)}`;

//# sourceMappingURL=generate-native-user-token.js.map
