"use strict";
Object.defineProperty(exports, /**
 * ユーザーを表す文字列を取得します。
 * @param user ユーザー
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../models/user");
const _render = require("./acct/render");
const _getusername = require("./get-user-name");
function _default(user) {
    let string = `${(0, _getusername.default)(user)} (@${(0, _render.default)(user)})\n` + `${user.notesCount}投稿、${user.followingCount}フォロー、${user.followersCount}フォロワー\n`;
    if ((0, _user.isLocalUser)(user)) {
        string += `場所: ${user.profile.location}、誕生日: ${user.profile.birthday}\n`;
    }
    return string + `「${user.description}」`;
}

//# sourceMappingURL=get-user-summary.js.map
