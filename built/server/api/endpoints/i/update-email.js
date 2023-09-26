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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _define = require("../../define");
const _nodemailer = require("nodemailer");
const _fetchmeta = require("../../../../misc/fetch-meta");
const _rndstr = require("rndstr");
const _config = require("../../../../config");
const _ms = require("ms");
const _bcryptjs = require("bcryptjs");
const _logger = require("../../logger");
const meta = {
    requireCredential: true,
    secure: true,
    limit: {
        duration: _ms('1hour'),
        max: 3
    },
    params: {
        password: {
            validator: _cafy.default.str
        },
        email: {
            validator: _cafy.default.optional.nullable.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Compare password
    const same = await _bcryptjs.compare(ps.password, user.password);
    if (!same) {
        throw new Error('incorrect password');
    }
    await _user.default.update(user._id, {
        $set: {
            email: ps.email,
            emailVerified: false,
            emailVerifyCode: null
        }
    });
    const iObj = await (0, _user.pack)(user._id, user, {
        detail: true,
        includeSecrets: true
    });
    // Publish meUpdated event
    (0, _stream.publishMainStream)(user._id, 'meUpdated', iObj);
    if (ps.email != null) {
        const code = (0, _rndstr.default)('a-z0-9', 16);
        await _user.default.update(user._id, {
            $set: {
                emailVerifyCode: code
            }
        });
        const meta = await (0, _fetchmeta.default)();
        const enableAuth = meta.smtpUser != null && meta.smtpUser !== '';
        const transporter = _nodemailer.createTransport({
            host: meta.smtpHost,
            port: meta.smtpPort,
            secure: meta.smtpSecure,
            ignoreTLS: !enableAuth,
            proxy: _config.default.proxySmtp,
            auth: enableAuth ? {
                user: meta.smtpUser,
                pass: meta.smtpPass
            } : undefined
        });
        const link = `${_config.default.url}/verify-email/${code}`;
        transporter.sendMail({
            from: meta.email,
            to: ps.email,
            subject: meta.name,
            text: `To verify email, please click this link: ${link}`
        }, (error, info)=>{
            if (error) {
                _logger.apiLogger.error(error);
                return;
            }
            _logger.apiLogger.info('Message sent: %s', info.messageId);
        });
    }
    return iObj;
});

//# sourceMappingURL=update-email.js.map
