"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _bcryptjs = require("bcryptjs");
const _user = require("../../../models/user");
const _generatenativeusertoken = require("../common/generate-native-user-token");
const _config = require("../../../config");
const _meta = require("../../../models/meta");
const _registrationtickets = require("../../../models/registration-tickets");
const _users = require("../../../services/chart/users");
const _fetchmeta = require("../../../misc/fetch-meta");
const _captcha = require("../../../misc/captcha");
const _genkeypair = require("../../../misc/gen-key-pair");
const _default = async (ctx)=>{
    var _instance;
    const body = ctx.request.body;
    const instance = await (0, _fetchmeta.default)();
    // Verify recaptcha
    // ただしテスト時はこの機構は障害となるため無効にする
    if (process.env.NODE_ENV !== 'test' && instance.enableRecaptcha && instance.recaptchaSecretKey) {
        await (0, _captcha.verifyRecaptcha)(instance.recaptchaSecretKey, body['g-recaptcha-response']).catch((e)=>{
            ctx.throw(400, e);
        });
    }
    const username = body['username'];
    const password = body['password'];
    const invitationCode = body['invitationCode'];
    //#region Validate invitation code
    let ticket;
    let lastTicket = false;
    if ((_instance = instance) === null || _instance === void 0 ? void 0 : _instance.disableRegistration) {
        if (invitationCode == null || typeof invitationCode !== 'string') {
            ctx.status = 400;
            ctx.body = 'invalid code format';
            return;
        }
        ticket = await _registrationtickets.default.findOne({
            code: invitationCode
        });
        if (ticket == null) {
            // invalid code
            ctx.status = 401;
            ctx.body = 'invalid code';
            return;
        }
        // Check expire
        if (ticket.expiresAt) {
            if (ticket.expiresAt < new Date()) {
                ctx.status = 403;
                ctx.body = 'expired';
                return;
            }
        }
        var _ticket_restCount;
        // Check count
        const restCount = (_ticket_restCount = ticket.restCount) !== null && _ticket_restCount !== void 0 ? _ticket_restCount : 1;
        if (restCount < 1) {
            ctx.body = 'limit exceeded';
            ctx.status = 403;
            return;
        }
        if (restCount === 1) lastTicket = true;
    }
    //#endregion
    // Validate username
    if (!(0, _user.validateUsername)(username)) {
        ctx.status = 400;
        return;
    }
    // Validate password
    if (!(0, _user.validatePassword)(password)) {
        ctx.status = 400;
        return;
    }
    const usersCount = await _user.default.count({});
    // Fetch exist user that same username
    const usernameExist = await _user.default.count({
        usernameLower: username.toLowerCase(),
        host: null
    }, {
        limit: 1
    });
    // Check username already used
    if (usernameExist !== 0) {
        ctx.status = 400;
        return;
    }
    // Generate hash of password
    const salt = await _bcryptjs.genSalt(8);
    const hash = await _bcryptjs.hash(password, salt);
    // Generate secret
    const secret = (0, _generatenativeusertoken.default)();
    const keyPair = await (0, _genkeypair.genRsaKeyPair)();
    // Create account
    const account = await _user.default.insert({
        avatarId: null,
        bannerId: null,
        createdAt: new Date(),
        description: null,
        followersCount: 0,
        followingCount: 0,
        name: null,
        notesCount: 0,
        username: username,
        usernameLower: username.toLowerCase(),
        host: null,
        keypair: keyPair.privateKey,
        token: secret,
        password: hash,
        isAdmin: _config.default.autoAdmin && usersCount === 0,
        carefulMassive: true,
        refuseFollow: false,
        autoAcceptFollowed: true,
        profile: {
            bio: null,
            birthday: null,
            location: null
        },
        settings: {
            autoWatch: false
        }
    });
    if (ticket) {
        if (lastTicket) {
            _registrationtickets.default.remove({
                _id: ticket._id
            });
        } else {
            _registrationtickets.default.update({
                _id: ticket._id
            }, {
                $push: {
                    inviteeIds: account._id
                },
                $inc: {
                    restCount: -1
                }
            });
        }
    }
    //#region Increment users count
    _meta.default.update({}, {
        $inc: {
            'stats.usersCount': 1,
            'stats.originalUsersCount': 1
        }
    }, {
        upsert: true
    });
    //#endregion
    _users.default.update(account, true);
    const res = await (0, _user.pack)(account, account, {
        detail: true,
        includeSecrets: true
    });
    res.token = secret;
    ctx.body = res;
};

//# sourceMappingURL=signup.js.map
