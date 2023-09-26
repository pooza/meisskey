"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getSystem1: function() {
        return getSystem1;
    },
    tryStockEmoji: function() {
        return tryStockEmoji;
    },
    stockEmoji: function() {
        return stockEmoji;
    }
});
const _user = require("../models/user");
const _createsystemuser = require("./create-system-user");
const _emoji = require("../models/emoji");
const _uploadfromurl = require("./drive/upload-from-url");
const _getdrivefileurl = require("../misc/get-drive-file-url");
const ACTOR_USERNAME = 'system.1';
async function getSystem1() {
    const user = await _user.default.findOne({
        host: null,
        username: ACTOR_USERNAME
    });
    if (user) return user;
    const created = await (0, _createsystemuser.createSystemUser)(ACTOR_USERNAME);
    return created;
}
async function tryStockEmoji(emoji) {
    if (emoji.host == null) {
        //console.log(`islocal`);
        return;
    }
    if (emoji.saved && emoji.md5 != null) {
        //console.log(`saved`);
        return;
    }
    return await stockEmoji(emoji);
}
async function stockEmoji(emoji) {
    const user = await getSystem1();
    const file = await (0, _uploadfromurl.uploadFromUrl)({
        url: emoji.url,
        user,
        force: true
    });
    const url = (0, _getdrivefileurl.default)(file);
    if (!url) {
        //console.log(`!url`);
        return;
    }
    console.log(`saved remote emoji: ${emoji.url} => ${url}`);
    await _emoji.default.update({
        _id: emoji._id
    }, {
        $set: {
            url,
            md5: file.md5,
            saved: true
        }
    });
}

//# sourceMappingURL=emoji-store.js.map
