"use strict";
const _user = require("../models/user");
const _note = require("../models/note");
const _mongodb = require("mongodb");
const _favorite = require("../models/favorite");
const _array = require("../prelude/array");
const _meid7 = require("../misc/id/meid7");
const _isquote = require("../misc/is-quote");
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
        if (!user) continue;
        console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);
        const exIds = (0, _array.concat)([
            favs.map((x)=>x.noteId),
            user.pinnedNoteIds || []
        ]);
        const notes = await _note.default.find({
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
                    renoteId: {
                        $ne: null
                    }
                }
            ]
        });
        for (const note of notes){
            var _note__renote, _target;
            //#region Renote/Quote先がローカルならスキップ
            const target = await _user.default.findOne({
                _id: (_note__renote = note._renote) === null || _note__renote === void 0 ? void 0 : _note__renote.userId
            });
            if (!target) continue;
            if (((_target = target) === null || _target === void 0 ? void 0 : _target.host) == null) continue;
            //#endregion
            console.log(`Unrenote/Unquote ${note._id}`);
            await _note.default.update({
                _id: note.renoteId
            }, {
                $inc: {
                    renoteCount: -1,
                    quoteCount: (0, _isquote.default)(note) ? -1 : 0
                }
            });
            await _note.default.remove({
                _id: note._id
            });
        }
    }
}
const args = process.argv.slice(2);
main(args[0]).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-old-renotes.js.map
