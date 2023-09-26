// 消したリモートユーザーを物理削除する、削除フラグリセット、clean-deleted-user-objsをやった後にやる、使うな
"use strict";
const _user = require("../models/user");
async function main(host) {
    if (!host) throw 'host required';
    const users = await _user.default.find({
        isDeleted: true,
        host
    }, {
        fields: {
            _id: true
        }
    });
    let prs = 0;
    for (const u of users){
        prs++;
        const user = await _user.default.findOne({
            _id: u._id
        });
        console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);
        await _user.default.remove({
            _id: u._id
        });
    }
}
const args = process.argv.slice(2);
main(args[0]).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=_delete-deleted-user-by-hosts.js.map
