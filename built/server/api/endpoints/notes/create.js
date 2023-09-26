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
const _cafyid = require("../../../../misc/cafy-id");
const _ms = require("ms");
const _stringz = require("stringz");
const _note = require("../../../../models/note");
const _user = require("../../../../models/user");
const _drivefile = require("../../../../models/drive-file");
const _create = require("../../../../services/note/create");
const _define = require("../../define");
const _fetchmeta = require("../../../../misc/fetch-meta");
const _error = require("../../error");
const _lodash = require("lodash");
const _array = require("../../../../prelude/array");
let maxNoteTextLength = 1000;
setInterval(()=>{
    (0, _fetchmeta.default)().then((m)=>{
        maxNoteTextLength = m.maxNoteTextLength;
    });
}, 30000);
const meta = {
    stability: 'stable',
    desc: {
        'ja-JP': '投稿します。'
    },
    tags: [
        'notes'
    ],
    requireCredential: true,
    limit: {
        duration: _ms('1hour'),
        max: 300
    },
    kind: [
        'write:notes',
        'note-write'
    ],
    params: {
        visibility: {
            validator: _cafy.default.optional.str.or([
                'public',
                'home',
                'followers',
                'specified',
                'private'
            ]),
            default: undefined,
            desc: {
                'ja-JP': '投稿の公開範囲。未指定の場合は、renoteId が指定されている場合は home に、指定されていなければ public になります。'
            }
        },
        visibleUserIds: {
            validator: _cafy.default.optional.arr(_cafy.default.type(_cafyid.default)),
            transform: _cafyid.transformMany,
            desc: {
                'ja-JP': '(投稿の公開範囲が specified の場合)投稿を閲覧できるユーザー'
            }
        },
        text: {
            validator: _cafy.default.optional.nullable.str.pipe((text)=>(0, _stringz.length)(text.trim()) <= maxNoteTextLength),
            default: null,
            desc: {
                'ja-JP': '投稿内容'
            }
        },
        cw: {
            validator: _cafy.default.optional.nullable.str.pipe(_note.isValidCw),
            desc: {
                'ja-JP': 'コンテンツの警告。このパラメータを指定すると設定したテキストで投稿のコンテンツを隠す事が出来ます。'
            }
        },
        viaMobile: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'モバイルデバイスからの投稿か否か。'
            }
        },
        localOnly: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'ローカルのみに投稿か否か。'
            }
        },
        copyOnce: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'copyOnce'
            }
        },
        noExtractMentions: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '本文からメンションを展開しないか否か。'
            }
        },
        noExtractHashtags: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '本文からハッシュタグを展開しないか否か。'
            }
        },
        noExtractEmojis: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': '本文からカスタム絵文字を展開しないか否か。'
            }
        },
        preview: {
            validator: _cafy.default.optional.bool,
            default: false,
            desc: {
                'ja-JP': 'preview'
            }
        },
        geo: {
            validator: _cafy.default.optional.nullable.obj({
                coordinates: _cafy.default.arr().length(2).item(0, _cafy.default.num.range(-180, 180)).item(1, _cafy.default.num.range(-90, 90)),
                altitude: _cafy.default.nullable.num,
                accuracy: _cafy.default.nullable.num,
                altitudeAccuracy: _cafy.default.nullable.num,
                heading: _cafy.default.nullable.num.range(0, 360),
                speed: _cafy.default.nullable.num
            }).strict(),
            desc: {
                'ja-JP': '位置情報'
            },
            ref: 'geo'
        },
        fileIds: {
            validator: _cafy.default.optional.arr(_cafy.default.type(_cafyid.default)).unique().range(1, 8),
            transform: _cafyid.transformMany,
            desc: {
                'ja-JP': '添付するファイル'
            }
        },
        mediaIds: {
            validator: _cafy.default.optional.arr(_cafy.default.type(_cafyid.default)).unique().range(1, 8),
            transform: _cafyid.transformMany,
            deprecated: true,
            desc: {
                'ja-JP': '添付するファイル (このパラメータは廃止予定です。代わりに fileIds を使ってください。)'
            }
        },
        replyId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '返信対象'
            }
        },
        renoteId: {
            validator: _cafy.default.optional.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': 'Renote対象'
            }
        },
        poll: {
            validator: _cafy.default.optional.obj({
                choices: _cafy.default.arr(_cafy.default.str).unique().range(2, 20).each((c)=>c.length > 0 && c.length <= 128),
                multiple: _cafy.default.optional.bool,
                expiresAt: _cafy.default.optional.nullable.num.int(),
                expiredAfter: _cafy.default.optional.nullable.num.int().min(1)
            }).strict(),
            desc: {
                'ja-JP': 'アンケート'
            },
            ref: 'poll'
        }
    },
    res: {
        type: 'object',
        properties: {
            createdNote: {
                type: 'Note',
                description: '作成した投稿'
            }
        }
    },
    errors: {
        noSuchRenoteTarget: {
            message: 'No such renote target.',
            code: 'NO_SUCH_RENOTE_TARGET',
            id: 'b5c90186-4ab0-49c8-9bba-a1f76c282ba4'
        },
        cannotReRenote: {
            message: 'You can not Renote a pure Renote.',
            code: 'CANNOT_RENOTE_TO_A_PURE_RENOTE',
            id: 'fd4cc33e-2a37-48dd-99cc-9b806eb2031a'
        },
        noSuchReplyTarget: {
            message: 'No such reply target.',
            code: 'NO_SUCH_REPLY_TARGET',
            id: '749ee0f6-d3da-459a-bf02-282e2da4292c'
        },
        cannotReplyToPureRenote: {
            message: 'You can not reply to a pure Renote.',
            code: 'CANNOT_REPLY_TO_A_PURE_RENOTE',
            id: '3ac74a84-8fd5-4bb0-870f-01804f82ce15'
        },
        contentRequired: {
            message: 'Content required. You need to set text, fileIds, renoteId or poll.',
            code: 'CONTENT_REQUIRED',
            id: '6f57e42b-c348-439b-bc45-993995cc515a'
        },
        cannotCreateAlreadyExpiredPoll: {
            message: 'Poll is already expired.',
            code: 'CANNOT_CREATE_ALREADY_EXPIRED_POLL',
            id: '04da457d-b083-4055-9082-955525eda5a5'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user, app)=>{
    var _ps_text;
    if (((_ps_text = ps.text) === null || _ps_text === void 0 ? void 0 : _ps_text.trim()) === '') ps.text = null;
    if (ps.visibility == null) {
        ps.visibility = ps.renoteId ? 'home' : 'public';
    }
    let visibleUsers = [];
    if (ps.visibleUserIds) {
        const users = await Promise.all((0, _lodash.uniqBy)(ps.visibleUserIds, (x)=>`${x}`).map((id)=>_user.default.findOne({
                _id: id
            })));
        visibleUsers = (0, _array.removeNull)(users);
    }
    let files = [];
    const fileIds = ps.fileIds != null ? ps.fileIds : ps.mediaIds != null ? ps.mediaIds : null;
    if (fileIds != null) {
        files = await Promise.all(fileIds.map((fileId)=>{
            return _drivefile.default.findOne({
                _id: fileId,
                'metadata.userId': user._id
            });
        }));
        files = files.filter((file)=>file != null);
    }
    let renote = null;
    if (ps.renoteId != null) {
        // Fetch renote to note
        renote = await _note.default.findOne({
            _id: ps.renoteId
        });
        if (renote == null) {
            throw new _error.ApiError(meta.errors.noSuchRenoteTarget);
        } else if (renote.renoteId && !renote.text && !renote.fileIds) {
            throw new _error.ApiError(meta.errors.cannotReRenote);
        }
    }
    let reply = null;
    if (ps.replyId != null) {
        // Fetch reply
        reply = await _note.default.findOne({
            _id: ps.replyId
        });
        if (reply === null) {
            throw new _error.ApiError(meta.errors.noSuchReplyTarget);
        }
        // 返信対象が引用でないRenoteだったらエラー
        if (reply.renoteId && !reply.text && !reply.fileIds) {
            throw new _error.ApiError(meta.errors.cannotReplyToPureRenote);
        }
    }
    if (ps.poll) {
        ps.poll.choices = ps.poll.choices.map((choice, i)=>({
                id: i,
                text: choice.trim(),
                votes: 0
            }));
        if (typeof ps.poll.expiresAt === 'number') {
            if (ps.poll.expiresAt < Date.now()) throw new _error.ApiError(meta.errors.cannotCreateAlreadyExpiredPoll);
        } else if (typeof ps.poll.expiredAfter === 'number') {
            ps.poll.expiresAt = Date.now() + ps.poll.expiredAfter;
        }
    }
    // テキストが無いかつ添付ファイルが無いかつRenoteも無いかつ投票も無かったらエラー
    if (!(ps.text || files.length || renote || ps.poll)) {
        throw new _error.ApiError(meta.errors.contentRequired);
    }
    // 後方互換性のため
    if (ps.visibility == 'private') {
        ps.visibility = 'specified';
    }
    // 投稿を作成
    const note = await (0, _create.default)(user, {
        preview: ps.preview,
        createdAt: new Date(),
        files: files,
        poll: ps.poll ? {
            choices: ps.poll.choices,
            multiple: ps.poll.multiple || false,
            expiresAt: ps.poll.expiresAt ? new Date(ps.poll.expiresAt) : null
        } : undefined,
        text: ps.text,
        reply,
        renote,
        cw: ps.cw,
        app,
        viaMobile: ps.viaMobile,
        localOnly: ps.localOnly,
        copyOnce: ps.copyOnce,
        visibility: ps.visibility,
        visibleUsers,
        apMentions: ps.noExtractMentions ? [] : undefined,
        apHashtags: ps.noExtractHashtags ? [] : undefined,
        apEmojis: ps.noExtractEmojis ? [] : undefined,
        geo: ps.geo
    });
    return {
        createdNote: await (0, _note.pack)(note, user)
    };
});

//# sourceMappingURL=create.js.map
