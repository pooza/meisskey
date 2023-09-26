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
const _crypto = require("crypto");
const _cafy = require("cafy");
const _app = require("../../../../models/app");
const _authsession = require("../../../../models/auth-session");
const _accesstoken = require("../../../../models/access-token");
const _define = require("../../define");
const _error = require("../../error");
const _securerndstr = require("../../../../misc/secure-rndstr");
const meta = {
    tags: [
        'auth'
    ],
    requireCredential: true,
    secure: true,
    params: {
        token: {
            validator: _cafy.default.str
        }
    },
    errors: {
        noSuchSession: {
            message: 'No such session.',
            code: 'NO_SUCH_SESSION',
            id: '9c72d8de-391a-43c1-9d06-08d29efde8df'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Fetch token
    const session = await _authsession.default.findOne({
        token: ps.token
    });
    if (session === null) {
        throw new _error.ApiError(meta.errors.noSuchSession);
    }
    // Generate access token
    const accessToken = (0, _securerndstr.secureRndstr)(32, true);
    // Fetch exist access token
    const exist = await _accesstoken.default.findOne({
        appId: session.appId,
        userId: user._id
    });
    if (exist === null) {
        // Lookup app
        const app = await _app.default.findOne({
            _id: session.appId
        });
        // Generate Hash
        const sha256 = _crypto.createHash('sha256');
        sha256.update(accessToken + app.secret);
        const hash = sha256.digest('hex');
        // Insert access token doc
        await _accesstoken.default.insert({
            createdAt: new Date(),
            appId: session.appId,
            userId: user._id,
            token: accessToken,
            hash: hash
        });
    }
    // Update session
    await _authsession.default.update(session._id, {
        $set: {
            userId: user._id
        }
    });
    return;
});

//# sourceMappingURL=accept.js.map
