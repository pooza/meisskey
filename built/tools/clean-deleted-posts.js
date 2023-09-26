// 90日以内の削除済みリモート投稿を物理削除する
"use strict";
const _user = require("../models/user");
const _note = require("../models/note");
const _meid7 = require("../misc/id/meid7");
const _mongodb = require("mongodb");
async function main(days = 90) {
    const limit = new Date(Date.now() - days * 1000 * 86400);
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(limit));
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
        const result = await _note.default.remove({
            $and: [
                {
                    userId: user._id
                },
                {
                    _id: {
                        $lt: id
                    }
                },
                {
                    deletedAt: {
                        $exists: true
                    }
                }
            ]
        });
        console.log(`  deleted count:${result.deletedCount}`);
    }
}
const args = process.argv.slice(2);
main(args[0]).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-deleted-posts.js.map
