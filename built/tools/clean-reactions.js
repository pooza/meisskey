// リモート → リモートのリアクションレコードを削除する
// current cursor で出てくる値を引数として指定することで続きから出来る
// Ex:
// npx ts-node --swc src/tools/clean-reactions.ts
// npx ts-node --swc src/tools/clean-reactions.ts 640891ec38affb31fb87b14d
"use strict";
const _mongodb = require("mongodb");
const _notereaction = require("../models/note-reaction");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
/**
  * @param c 継続用cursor
 */ async function main(c) {
    let cursor = c ? new _mongodb.ObjectID(c) : null;
    while(true){
        console.log(`current cursor: ${cursor}`);
        // query note reactions
        const datas = await _notereaction.default.aggregate([
            {
                $match: _object_spread({}, cursor ? {
                    _id: {
                        $gt: cursor
                    }
                } : {})
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $limit: 100
            },
            // Join user
            {
                $lookup: {
                    from: 'users',
                    let: {
                        userId: '$userId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$_id',
                                        '$$userId'
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: true,
                                host: true
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            // Join note
            {
                $lookup: {
                    from: 'notes',
                    let: {
                        noteId: '$noteId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$_id',
                                        '$$noteId'
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                userId: true,
                                '_user.host': true
                            }
                        }
                    ],
                    as: 'note'
                }
            },
            {
                $unwind: '$note'
            }
        ]);
        if (datas.length === 0) {
            console.log('fin');
            break;
        }
        cursor = datas[datas.length - 1]._id;
        for (const data of datas){
            var _data_createdAt;
            const del = data.user.host != null && data.note._user.host != null;
            console.log(`${del ? 'DEL' : 'SKP'} ${data._id} ${(_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : _data_createdAt.toISOString()} ${data.user.host} => ${data.note._user.host}`);
            if (del) {
                await _notereaction.default.remove({
                    _id: data._id
                });
            }
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

//# sourceMappingURL=clean-reactions.js.map
