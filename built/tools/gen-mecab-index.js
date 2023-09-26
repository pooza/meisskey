// node gen-mecab-index 日数 [global]
// でローカルの過去投稿の検索インデックスを作成する
"use strict";
const _note = require("../models/note");
const _meid7 = require("../misc/id/meid7");
const _mecab = require("../misc/mecab");
const _mongodb = require("mongodb");
async function main(days, global = false) {
    const limit = new Date(Date.now() - days * 1000 * 86400);
    const id = new _mongodb.ObjectID((0, _meid7.genMeid7)(limit));
    while(true){
        let q;
        if (global) {
            q = {
                _id: {
                    $gt: id
                },
                mecabWords: {
                    $exists: false
                }
            };
        } else {
            q = {
                '_user.host': null,
                _id: {
                    $gt: id
                },
                mecabWords: {
                    $exists: false
                }
            };
        }
        const note = await _note.default.findOne(q);
        if (!note) {
            console.log('no more Notes');
            break;
        }
        console.log(note._id);
        const mecabWords = await (0, _mecab.getIndexer)(note);
        console.log(JSON.stringify(mecabWords, null, 2));
        await _note.default.findOneAndUpdate({
            _id: note._id
        }, {
            $set: {
                mecabWords
            }
        });
    }
}
const args = process.argv.slice(2);
main(Number(args[0] || '1'), args[1] === 'global').then(()=>{
    console.log('Done');
});

//# sourceMappingURL=gen-mecab-index.js.map
