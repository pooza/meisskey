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
const _cafy = require("cafy");
const _app = require("../../../../../models/app");
const _authsession = require("../../../../../models/auth-session");
const _accesstoken = require("../../../../../models/access-token");
const _user = require("../../../../../models/user");
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
        },
        token: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'セッションのトークン',
                'en-US': 'The token of a session.'
            }
        }
    },
    res: {
        type: 'object',
        properties: {
            accessToken: {
                type: 'string',
                description: 'ユーザーのアクセストークン'
            },
            user: {
                type: 'User',
                description: '認証したユーザー'
            }
        }
    },
    errors: {
        noSuchApp: {
            message: 'No such app.',
            code: 'NO_SUCH_APP',
            id: 'fcab192a-2c5a-43b7-8ad8-9b7054d8d40d'
        },
        noSuchSession: {
            message: 'No such session.',
            code: 'NO_SUCH_SESSION',
            id: '5b5a1503-8bc8-4bd0-8054-dc189e8cdcb3'
        },
        pendingSession: {
            message: 'This session is not completed yet.',
            code: 'PENDING_SESSION',
            id: '8c8a4145-02cc-4cca-8e66-29ba60445a8e'
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
    // Fetch token
    const session = await _authsession.default.findOne({
        token: ps.token,
        appId: app._id
    });
    if (session === null) {
        throw new _error.ApiError(meta.errors.noSuchSession);
    }
    if (session.userId == null) {
        throw new _error.ApiError(meta.errors.pendingSession);
    }
    // Lookup access token
    const accessToken = await _accesstoken.default.findOne({
        appId: app._id,
        userId: session.userId
    });
    // Delete session
    /* https://github.com/Automattic/monk/issues/178
	AuthSess.deleteOne({
		_id: session._id
	});
	*/ _authsession.default.remove({
        _id: session._id
    });
    return {
        accessToken: accessToken.token,
        user: await (0, _user.pack)(session.userId, null, {
            detail: true
        })
    };
});

//# sourceMappingURL=userkey.js.map
