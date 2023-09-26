"use strict";
Object.defineProperty(exports, //const logger = apLogger;
"default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _user = require("../../../../models/user");
const _config = require("../../../../config");
const _type = require("../../type");
const _abuseuserreport = require("../../../../models/abuse-user-report");
const _default = async (actor, activity)=>{
    // objectは `(User|Note) | (User|Note)[]` だけど、全パターンDBスキーマと対応させられないので
    // 対象ユーザーは一番最初のユーザー として あとはコメントとして格納する
    const uris = (0, _type.getApIds)(activity.object);
    const userIds = uris.filter((uri)=>uri.startsWith(_config.default.url + '/users/')).map((uri)=>uri.split('/').pop());
    const users = await _user.default.find({
        _id: {
            $in: userIds
        }
    });
    if (users.length < 1) return `skip`;
    await _abuseuserreport.default.insert({
        createdAt: new Date(),
        userId: users[0]._id,
        reporterId: actor._id,
        comment: `${activity.content}\n${JSON.stringify(uris, null, 2)}`
    });
    return `ok`;
};

//# sourceMappingURL=index.js.map
