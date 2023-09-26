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
const _define = require("../define");
const _ms = require("ms");
const _sendemail = require("../../../services/send-email");
const _user = require("../../../models/user");
const _passwordresetrequest = require("../../../models/password-reset-request");
const _config = require("../../../config");
const _securerndstr = require("../../../misc/secure-rndstr");
const _logger = require("../logger");
const meta = {
    tags: [
        'reset password'
    ],
    requireCredential: false,
    limit: {
        duration: _ms('1hour'),
        max: 3
    },
    params: {
        username: {
            validator: _cafy.default.str.min(1)
        },
        email: {
            validator: _cafy.default.str.min(1)
        }
    },
    errors: {}
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const user = await _user.default.findOne({
        usernameLower: ps.username.toLowerCase(),
        host: null
    });
    // そのユーザーは存在しない
    if (user == null) {
        _logger.apiLogger.warn(`Reset password requested for ${ps.username}, but not found.`);
        return; // エラー内容を返してもいい
    }
    // ローカルユーザーではない (これがマッチすることはない)
    if (!(0, _user.isLocalUser)(user)) throw new Error();
    // 削除済み
    if (user.isDeleted != null) {
        _logger.apiLogger.warn(`Reset password requested for ${ps.username}, but deleted.`);
        return; // エラー内容を返してもいい
    }
    // 凍結されている
    if (user.isSuspended) {
        _logger.apiLogger.warn(`Reset password requested for ${ps.username}, but suspended.`);
        return; // エラー内容を返してもいい
    }
    // 合致するメアドが登録されていなかったら無視
    if (user.email !== ps.email) {
        try {
            _logger.apiLogger.warn(`Reset password requested for ${ps.username}, but email missmatch.`);
        } catch (e) {}
        return; // エラー内容はあえて返さない
    }
    // メアドが認証されていなかったら無視
    if (!user.emailVerified) {
        try {
            _logger.apiLogger.warn(`Reset password requested for ${ps.username}, but email not verified.`);
        } catch (e) {}
        return; // エラー内容はあえて返さない
    }
    const token = (0, _securerndstr.secureRndstr)(50);
    await _passwordresetrequest.default.insert({
        createdAt: new Date(),
        userId: user._id,
        token
    });
    const link = `${_config.default.url}/reset-password/${token}`;
    (0, _sendemail.sendEmail)(ps.email, 'Password reset requested', `To reset password, please click the URL below.\n${link}`);
});

//# sourceMappingURL=request-reset-password.js.map
