// 90日より古い検索などのインデックスを削除する
"use strict";
const _user = require("../models/user");
const _note = require("../models/note");
const _meid7 = require("../misc/id/meid7");
const _mongodb = require("mongodb");
async function main(days = 90) {
    const limit = new Date(Date.now() - days * 1000 * 86400);
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(limit));
    const limit2 = new Date(Date.now() - 1 * 1000 * 86400);
    const id2 = new _mongodb.ObjectID((0, _meid7.genMeid7)(limit2));
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
        const result = await _note.default.update({
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
                    mecabWords: {
                        $ne: null
                    }
                }
            ]
        }, {
            $set: {
                mecabWords: undefined
            }
        }, {
            multi: true
        });
        console.log(`  clear count mecab:${result.n}`);
        const result2 = await _note.default.update({
            $and: [
                {
                    userId: user._id
                },
                {
                    _id: {
                        $lt: id2
                    }
                },
                {
                    trendWords: {
                        $exists: null
                    }
                }
            ]
        }, {
            $set: {
                trendWords: undefined
            }
        }, {
            multi: true
        });
        console.log(`  clear count trend:${result2.n}`);
    }
}
const args = process.argv.slice(2);
main(args[0] ? Number(args[0]) : undefined).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-old-index.js.map
