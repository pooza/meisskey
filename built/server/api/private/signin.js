"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _bcryptjs = require("bcryptjs");
const _speakeasy = require("speakeasy");
const _user = require("../../../models/user");
const _signin = require("../../../models/signin");
const _stream = require("../../../services/stream");
const _signin1 = require("../common/signin");
const _config = require("../../../config");
const _limiter = require("../limiter");
const _default = async (ctx)=>{
    ctx.set('Access-Control-Allow-Origin', _config.default.url);
    ctx.set('Access-Control-Allow-Credentials', 'true');
    const ep = {
        name: 'signin',
        exec: null,
        meta: {
            limit: {
                duration: 300 * 1000,
                max: 10
            }
        }
    };
    await (0, _limiter.default)(ep, undefined, ctx.ip).catch((e)=>{
        ctx.throw(429);
    });
    const body = ctx.request.body;
    const username = body['username'];
    const password = body['password'];
    const token = body['token'];
    if (typeof username != 'string') {
        ctx.status = 400;
        return;
    }
    if (typeof password != 'string') {
        ctx.status = 400;
        return;
    }
    if (token != null && typeof token != 'string') {
        ctx.status = 400;
        return;
    }
    // Fetch user
    const user = await _user.default.findOne({
        usernameLower: username.toLowerCase(),
        host: null
    }, {
        fields: {
            data: false,
            profile: false
        }
    });
    if (user == null || user.isDeleted || user.isSuspended) {
        ctx.throw(404, {
            error: 'user not found'
        });
        return;
    }
    // Compare password
    const same = await _bcryptjs.compare(password, user.password);
    if (same) {
        if (user.twoFactorEnabled) {
            const verified = _speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token
            });
            if (verified) {
                (0, _signin1.default)(ctx, user);
            } else {
                ctx.throw(403, {
                    error: 'invalid token'
                });
            }
        } else {
            (0, _signin1.default)(ctx, user);
        }
    } else {
        ctx.throw(403, {
            error: 'incorrect password'
        });
    }
    // Append signin history
    const record = await _signin.default.insert({
        createdAt: new Date(),
        userId: user._id,
        ip: ctx.ip,
        headers: ctx.headers,
        success: same
    });
    // Publish signin event
    (0, _stream.publishMainStream)(user._id, 'signin', await (0, _signin.pack)(record));
};

//# sourceMappingURL=signin.js.map
