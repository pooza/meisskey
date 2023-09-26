"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    logger: function() {
        return logger;
    },
    sendEmail: function() {
        return sendEmail;
    }
});
const _nodemailer = require("nodemailer");
const _logger = require("./logger");
const _config = require("../config");
const _fetchmeta = require("../misc/fetch-meta");
const logger = new _logger.default('email');
async function sendEmail(to, subject, text) {
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
    try {
        const info = await transporter.sendMail({
            from: meta.email,
            to: to,
            subject: subject || 'Misskey',
            text: text
        });
        logger.info(`Message sent: ${info.messageId}`);
    } catch (e) {
        logger.error(e);
        throw e;
    }
}

//# sourceMappingURL=send-email.js.map
