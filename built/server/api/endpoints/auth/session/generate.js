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
const _uuid = require("uuid");
const _cafy = require("cafy");
const _app = require("../../../../../models/app");
const _authsession = require("../../../../../models/auth-session");
const _config = require("../../../../../config");
const _define = require("../../../define");
const _error = require("../../../error");
const meta = {
    tags: [
        'auth'
    ],
    requireCredential: false,
    params: {
        appSecret: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'アプリケーションのシークレットキー',
                'en-US': 'The secret key of your application.'
            }
        }
    },
    res: {
        type: 'object',
        properties: {
            token: {
                type: 'string',
                description: 'セッションのトークン'
            },
            url: {
                type: 'string',
                description: 'セッションのURL'
            }
        }
    },
    errors: {
        noSuchApp: {
            message: 'No such app.',
            code: 'NO_SUCH_APP',
            id: '92f93e63-428e-4f2f-a5a4-39e1407fe998'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    // Lookup app
    const app = await _app.default.findOne({
        secret: ps.appSecret
    });
    if (app == null) {
        throw new _error.ApiError(meta.errors.noSuchApp);
    }
    // Generate token
    const token = (0, _uuid.v4)();
    // Create session token document
    const doc = await _authsession.default.insert({
        createdAt: new Date(),
        appId: app._id,
        token: token
    });
    return {
        token: doc.token,
        url: `${_config.default.authUrl}/${doc.token}`
    };
});

//# sourceMappingURL=generate.js.map
