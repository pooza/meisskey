"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _escaperegexp = require("escape-regexp");
const _user = require("../../../../models/user");
const _define = require("../../define");
const _converthost = require("../../../../misc/convert-host");
const _instance = require("../../../../models/instance");
const _array = require("../../../../prelude/array");
const _usertag = require("../../../../models/usertag");
const meta = {
    desc: {
        'ja-JP': 'ユーザーを検索します。'
    },
    tags: [
        'users'
    ],
    requireCredential: false,
    allowGet: true,
    cacheSec: 300,
    params: {
        query: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'クエリ'
            }
        },
        offset: {
            validator: _cafy.default.optional.num.min(0),
            default: 0,
            desc: {
                'ja-JP': 'オフセット'
            }
        },
        limit: {
            validator: _cafy.default.optional.num.range(1, 100),
            default: 10,
            desc: {
                'ja-JP': '取得する数'
            }
        },
        localOnly: {
            validator: _cafy.default.optional.boolean,
            default: false,
            desc: {
                'ja-JP': 'ローカルユーザーのみ検索対象にするか否か'
            }
        },
        detail: {
            validator: _cafy.default.optional.boolean,
            default: true,
            desc: {
                'ja-JP': '詳細なユーザー情報を含めるか否か'
            }
        }
    },
    res: {
        type: 'array',
        items: {
            type: 'User'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const isName = !ps.query.startsWith('@') || ps.query.replace('@', '').match(/^[\W-]/) != null;
    const isUsername = ps.query.replace('@', '').match(/^\w([\w-]*\w)?$/);
    const isHostname = ps.query.replace('@', '').match(/\./) != null;
    let users = [];
    // 隠すインスタンス
    const hideInstances = await _instance.default.find({
        $or: [
            {
                isBlocked: true
            }
        ]
    }, {
        fields: {
            host: true
        }
    });
    // 隠すホスト
    const hideHosts = hideInstances.map((x)=>(0, _converthost.toDbHost)(x.host));
    const hideHostsForRemote = (0, _array.concat)([
        hideHosts,
        [
            null
        ]
    ]);
    // 表示名/ユーザータグ
    if (isName) {
        const name = ps.query.replace(/^-/, '');
        if (me) {
            const usertags = await _usertag.default.find({
                ownerId: me._id,
                tags: name
            });
            users = await _user.default.find({
                _id: {
                    $in: usertags.map((x)=>x.targetId)
                },
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            });
        }
        if (users.length < ps.limit) {
            // local
            const otherUsers = await _user.default.find({
                host: null,
                name: new RegExp(_escaperegexp(name), 'i'),
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            }, {
                limit: ps.limit,
                skip: ps.offset
            });
            users = users.concat(otherUsers);
        }
        if (users.length < ps.limit && !ps.localOnly) {
            // try remote
            const otherUsers = await _user.default.find({
                host: {
                    $nin: hideHostsForRemote
                },
                name: new RegExp(_escaperegexp(name), 'i'),
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            }, {
                limit: ps.limit - users.length
            });
            users = users.concat(otherUsers);
        }
    // ユーザー名
    } else if (isUsername) {
        // まず、username (local/remote) の完全一致でアクティブ順
        if (users.length < ps.limit && !ps.localOnly) {
            users = await _user.default.find({
                host: {
                    $nin: hideHosts
                },
                usernameLower: ps.query.replace('@', '').toLowerCase(),
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            }, {
                limit: ps.limit - users.length,
                skip: ps.offset,
                sort: {
                    updatedAt: -1
                }
            });
        }
        const ids = users.map((user)=>user._id);
        // 足りなかったら、username (local) の前方一致でid順
        if (users.length < ps.limit) {
            const otherUsers = await _user.default.find({
                _id: {
                    $nin: ids
                },
                host: null,
                usernameLower: new RegExp('^' + _escaperegexp(ps.query.replace('@', '').toLowerCase())),
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            }, {
                limit: ps.limit - users.length,
                skip: ps.offset
            });
            users = users.concat(otherUsers);
        }
        // 足りなかったら、username (remote) の前方一致でid順
        if (users.length < ps.limit && !ps.localOnly) {
            const otherUsers = await _user.default.find({
                _id: {
                    $nin: ids
                },
                host: {
                    $nin: hideHostsForRemote
                },
                usernameLower: new RegExp('^' + _escaperegexp(ps.query.replace('@', '').toLowerCase())),
                isDeleted: {
                    $ne: true
                },
                isSuspended: {
                    $ne: true
                }
            }, {
                limit: ps.limit - users.length,
                skip: ps.offset
            });
            users = users.concat(otherUsers);
        }
    // ホスト名
    } else if (isHostname) {
        users = await _user.default.find({
            host: (0, _converthost.isSelfHost)(ps.query) ? null : (0, _converthost.toDbHost)(ps.query.replace('@', '')),
            isDeleted: {
                $ne: true
            },
            isSuspended: {
                $ne: true
            }
        }, {
            limit: ps.limit - users.length
        });
    }
    return await Promise.all(users.map((user)=>(0, _user.pack)(user, me, {
            detail: ps.detail
        })));
});

//# sourceMappingURL=search.js.map
