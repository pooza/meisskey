// 90日以内のFav/PinもリアクションもRenoteもされてないリモート投稿を削除する
"use strict";
const _user = require("../models/user");
const _note = require("../models/note");
const _favorite = require("../models/favorite");
const _array = require("../prelude/array");
const _meid7 = require("../misc/id/meid7");
const _mongodb = require("mongodb");
async function main(days = 90) {
    const limit = new Date(Date.now() - days * 1000 * 86400);
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(limit));
    // favs
    const favs = await _favorite.default.find({
        noteId: {
            $lt: id
        }
    });
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
        const exIds = (0, _array.concat)([
            favs.map((x)=>x.noteId),
            user.pinnedNoteIds || []
        ]);
        const result = await _note.default.remove({
            $and: [
                {
                    userId: user._id
                },
                {
                    _id: {
                        $nin: exIds
                    }
                },
                {
                    _id: {
                        $lt: id
                    }
                },
                {
                    $or: [
                        {
                            renoteCount: {
                                $exists: false
                            }
                        },
                        {
                            renoteCount: 0
                        }
                    ]
                },
                {
                    repliesCount: {
                        $exists: false
                    }
                },
                {
                    reactionCounts: {
                        $exists: false
                    }
                },
                {
                    replyId: null
                },
                {
                    renoteId: null
                },
                {
                    mentions: {
                        $exists: false
                    } // TODO: ローカルユーザーへのメンションが含まれている場合のみにする
                }
            ]
        });
        console.log(`  deleted count:${result.deletedCount}`);
    /*
		for (const note of notes) {
			//console.log(JSON.stringify(note, null, 2));
			console.log(`${note._id}`);
		}
		*/ }
}
const args = process.argv.slice(2);
main(args[0]).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-old-posts.js.map
