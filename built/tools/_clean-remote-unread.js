// かなり古いバグで生成されている可能性のあるリモートのNoteUnreadを削除します
"use strict";
const _user = require("../models/user");
const _noteunread = require("../models/note-unread");
async function main() {
    // remote users
    const users = await _user.default.find({
        host: {
            $ne: null
        }
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
        const result = await _noteunread.default.remove({
            userId: user._id
        });
        console.log(`  deleted count:${result.deletedCount}`);
    }
}
//const args = process.argv.slice(2);
main().then(()=>{
    console.log('Done');
});

//# sourceMappingURL=_clean-remote-unread.js.map
