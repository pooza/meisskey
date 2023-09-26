"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    AuthenticationError: function() {
        return AuthenticationError;
    },
    default: function() {
        return _default;
    }
});
const _app = require("../../models/app");
const _user = require("../../models/user");
const _accesstoken = require("../../models/access-token");
const _isnativetoken = require("./common/is-native-token");
let AuthenticationError = class AuthenticationError extends Error {
    constructor(message){
        super(message);
        this.name = 'AuthenticationError';
    }
};
const _default = async (token)=>{
    if (token == null) {
        return [
            null,
            null
        ];
    }
    if ((0, _isnativetoken.default)(token)) {
        // Fetch user
        const user = await _user.default.findOne({
            token
        });
        if (user == null) {
            throw new AuthenticationError('user not found');
        }
        return [
            user,
            null
        ];
    } else {
        const accessToken = await _accesstoken.default.findOne({
            hash: token.toLowerCase()
        });
        if (accessToken == null) {
            throw new AuthenticationError('invalid signature');
        }
        const app = await _app.default.findOne({
            _id: accessToken.appId
        });
        const user = await _user.default.findOne({
            _id: accessToken.userId
        });
        return [
            user,
            app
        ];
    }
};

//# sourceMappingURL=authenticate.js.map
