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
const _define = require("../../define");
const _config = require("../../../../config");
const _user = require("../../../../models/user");
const _person = require("../../../../remote/activitypub/models/person");
const _note = require("../../../../models/note");
const _note1 = require("../../../../remote/activitypub/models/note");
const _resolver = require("../../../../remote/activitypub/resolver");
const _error = require("../../error");
const _converthost = require("../../../../misc/convert-host");
const _type = require("../../../../remote/activitypub/type");
const _instancemoderation = require("../../../../services/instance-moderation");
const _ms = require("ms");
const _escaperegexp = require("escape-regexp");
const _fetch = require("../../../../misc/fetch");
const _emoji = require("../../../../models/emoji");
const meta = {
    tags: [
        'federation'
    ],
    desc: {
        'ja-JP': 'URIを指定してActivityPubオブジェクトを参照します。'
    },
    requireCredential: true,
    limit: {
        duration: _ms('1hour'),
        max: 3600
    },
    params: {
        uri: {
            validator: _cafy.default.str,
            desc: {
                'ja-JP': 'ActivityPubオブジェクトのURI'
            }
        }
    },
    errors: {
        noSuchObject: {
            message: 'No such object.',
            code: 'NO_SUCH_OBJECT',
            id: 'dc94d745-1262-4e63-a17d-fecaa57efc82'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    try {
        const object = await fetchAny(ps.uri);
        if (object) {
            return object;
        } else {
            throw new _error.ApiError(meta.errors.noSuchObject);
        }
    } catch (e) {
        if (e instanceof RejectedError) {
            throw new _error.ApiError(meta.errors.noSuchObject);
        }
        if (e instanceof _fetch.StatusError) {
            throw new _error.ApiError(meta.errors.noSuchObject);
        }
        throw e;
    }
});
/***
 * URIからUserかNoteを解決する
 */ async function fetchAny(uri) {
    // URIがこのサーバーを指しているなら、ローカルユーザーIDとしてDBからフェッチ
    if (uri.startsWith(_config.default.url + '/')) {
        const result = await processLocal(uri);
        if (result != null) return result;
    }
    // URI(AP Object id)としてDB検索
    const packed = await processRemote(uri);
    if (packed != null) return packed;
    // disableFederationならリモート解決しない
    if (_config.default.disableFederation) throw new RejectedError('Federation disabled');
    // ブロックしてたら中断
    if (await (0, _instancemoderation.isBlockedHost)((0, _converthost.extractApHost)(uri))) throw new RejectedError('Instance blocked');
    // リモートから一旦オブジェクトフェッチ
    const resolver = new _resolver.default();
    const object = await resolver.resolve(uri);
    // /@user のような正規id以外で取得できるURIが指定されていた場合、ここで初めて正規URIが確定する
    // これはDBに存在する可能性があるため再度DB検索
    if (typeof object.id === 'string' && object.id !== uri) {
        // URIがこのサーバーを指しているなら、ローカルユーザーIDとしてDBからフェッチ
        if (object.id.startsWith(_config.default.url + '/')) {
            return await processLocal(object.id);
        // ここで見つからなければローカルはなし確定なので流れ落ちなし
        }
        // ブロックしてたら中断
        if (await (0, _instancemoderation.isBlockedHost)((0, _converthost.extractApHost)(object.id))) throw new RejectedError('Instance blocked');
        // URI(AP Object id)としてDB検索
        const packed = await processRemote(object.id);
        if (packed !== null) return packed;
    }
    // それでもみつからなければ新規であるため登録
    if ((0, _type.isActor)(object)) {
        const user = await (0, _person.createPerson)((0, _type.getApId)(object));
        return await mergePack({
            user
        });
    }
    if ((0, _type.isPost)(object)) {
        const note = await (0, _note1.createNote)((0, _type.getApId)(object), null, true);
        return await mergePack({
            note
        });
    }
    if ((0, _type.isEmoji)(object)) {
        const emojis = await (0, _note1.extractEmojis)(object, (0, _converthost.extractApHost)(uri));
        return await mergePack({
            emoji: emojis[0]
        });
    }
    return null;
}
/**
 * Process local URI
 * @param uri Local URI
 * @returns Packed API response, or null on not found.
 * @throws RejectedError on deleted, moderated or hidden.
 */ async function processLocal(uri) {
    // https://local/(users|notes)/:id
    const localIdRegex = new RegExp('^' + _escaperegexp(_config.default.url) + '/' + '(\\w+)' + '/' + '(\\w+)/?$');
    const matchLocalId = uri.match(localIdRegex);
    if (matchLocalId) {
        const type = matchLocalId[1];
        const id = matchLocalId[2];
        return await mergePack({
            user: type === 'users' ? await _user.default.findOne({
                _id: id
            }) : null,
            note: type === 'notes' ? await _note.default.findOne({
                _id: id
            }) : null,
            emoji: type === 'emojis' ? await _emoji.default.findOne({
                name: id,
                host: null
            }) : null
        });
    }
    // https://local/@:username
    const localNameRegex = new RegExp('^' + _escaperegexp(_config.default.url) + '/@(\\w+)/?$');
    const matchLocalName = uri.match(localNameRegex);
    if (matchLocalName) {
        const username = matchLocalName[1];
        return await mergePack({
            user: await _user.default.findOne({
                usernameLower: username.toLowerCase()
            })
        });
    }
    return null;
}
/**
 * Process remote URI
 * @param uri Local URI
 * @returns Packed API response, or null on not found.
 * @throws RejectedError on deleted, moderated or hidden.
 */ async function processRemote(uri) {
    const [user, note, emoji] = await Promise.all([
        _user.default.findOne({
            uri: uri
        }),
        _note.default.findOne({
            uri: uri
        }),
        _emoji.default.findOne({
            uri: uri
        })
    ]);
    return await mergePack({
        user,
        note,
        emoji
    });
}
/**
 * Pack DB Object for API Response
 * @returns Packed API response, or null on not found.
 * @throws RejectedError on deleted, moderated or hidden.
 */ async function mergePack(opts) {
    if (opts.user != null) {
        if (opts.user.isDeleted) throw new RejectedError('User is deleted');
        if (opts.user.isSuspended) throw new RejectedError('User is suspended');
        return {
            type: 'User',
            object: await (0, _user.pack)(opts.user, null, {
                detail: true
            })
        };
    }
    if (opts.note != null) {
        var _packedNote;
        const packedNote = await (0, _note.pack)(opts.note, null, {
            detail: true
        });
        if ((_packedNote = packedNote) === null || _packedNote === void 0 ? void 0 : _packedNote.isHidden) throw new RejectedError('Note is hidden');
        return {
            type: 'Note',
            object: packedNote
        };
    }
    if (opts.emoji != null) {
        return {
            type: 'Emoji',
            object: {
                name: `${opts.emoji.name}${opts.emoji.host ? `@${opts.emoji.host}` : ''}`,
                host: opts.emoji.host,
                url: opts.emoji.url
            }
        };
    }
    return null;
}
let RejectedError = class RejectedError extends Error {
    constructor(message){
        super(message);
    }
};

//# sourceMappingURL=show.js.map
