"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    fetchNote: function() {
        return fetchNote;
    },
    createNote: function() {
        return createNote;
    },
    resolveNote: function() {
        return resolveNote;
    },
    extractEmojis: function() {
        return extractEmojis;
    },
    fetchReferences: function() {
        return fetchReferences;
    }
});
const _promiselimit = require("promise-limit");
const _config = require("../../../config");
const _resolver = require("../resolver");
const _create = require("../../../services/note/create");
const _type = require("../type");
const _person = require("./person");
const _image = require("./image");
const _htmltomfm = require("../misc/html-to-mfm");
const _emoji = require("../../../models/emoji");
const _mention = require("./mention");
const _tag = require("./tag");
const _ = require("punycode/");
const _array = require("../../../prelude/array");
const _question = require("./question");
const _vote = require("../../../services/note/polls/vote");
const _logger = require("../logger");
const _update = require("../../../services/note/polls/update");
const _converthost = require("../../../misc/convert-host");
const _applock = require("../../../misc/app-lock");
const _instancemoderation = require("../../../services/instance-moderation");
const _audience = require("../audience");
const _dbresolver = require("../db-resolver");
const _emojistore = require("../../../services/emoji-store");
const _date = require("../misc/date");
const _fetch = require("../../../misc/fetch");
const logger = _logger.apLogger;
function toNote(object, uri) {
    const expectHost = (0, _converthost.extractApHost)(uri);
    if (object == null) {
        throw new Error('invalid Note: object is null');
    }
    if (!(0, _type.isPost)(object)) {
        throw new Error(`invalid Note: invalid object type ${(0, _type.getApType)(object)}`);
    }
    if (object.id && (0, _converthost.extractApHost)(object.id) !== expectHost) {
        throw new Error(`invalid Note: id has different host. expected: ${expectHost}, actual: ${(0, _converthost.extractApHost)(object.id)}`);
    }
    if (object.attributedTo && (0, _converthost.extractApHost)((0, _type.getOneApId)(object.attributedTo)) !== expectHost) {
        throw new Error(`invalid Note: attributedTo has different host. expected: ${expectHost}, actual: ${(0, _converthost.extractApHost)((0, _type.getOneApId)(object.attributedTo))}`);
    }
    return object;
}
async function fetchNote(object) {
    const dbResolver = new _dbresolver.default();
    return await dbResolver.getNoteFromApId(object);
}
async function createNote(value, resolver, silent = false) {
    if (resolver == null) resolver = new _resolver.default();
    const object = await resolver.resolve(value);
    const entryUri = (0, _type.getApId)(value);
    let note;
    try {
        note = toNote(object, entryUri);
    } catch (err) {
        logger.error(`${err.message}`, {
            resolver: {
                history: resolver.getHistory()
            },
            value: value,
            object: object
        });
        return null;
    }
    logger.debug(`Note fetched: ${JSON.stringify(note, null, 2)}`);
    logger.info(`Creating the Note: ${note.id}`);
    // 投稿者をフェッチ
    if (!note.attributedTo) return null;
    const actor = await (0, _person.resolvePerson)((0, _type.getOneApId)(note.attributedTo), null, resolver);
    // 投稿者が凍結か削除されていたらスキップ
    if (actor.isSuspended || actor.isDeleted) {
        return null;
    }
    const noteAudience = await (0, _audience.parseAudience)(actor, note.to, note.cc, resolver);
    let visibility = noteAudience.visibility;
    const visibleUsers = noteAudience.visibleUsers;
    // Audience (to, cc) が指定されてなかった場合
    if (visibility === 'specified' && visibleUsers.length === 0) {
        if (typeof value === 'string') {
            // こちらから匿名GET出来たものならばpublic
            visibility = 'public';
        }
    }
    const apMentions = await (0, _mention.extractApMentions)(note.tag, resolver);
    const apHashtags = await (0, _tag.extractApHashtags)(note.tag);
    // 添付ファイル
    // Noteがsensitiveなら添付もsensitiveにする
    const limit = _promiselimit(2);
    note.attachment = (0, _array.toArray)(note.attachment);
    // 添付が多すぎたら無視
    if (note.attachment.length > 100) return null;
    const files = note.attachment.map((attach)=>attach.sensitive = note.sensitive) ? (await Promise.all(note.attachment.map((x)=>limit(()=>(0, _image.resolveImage)(actor, x))))).filter((image)=>image != null) : [];
    // リプライ
    let replyError = false;
    const reply = note.inReplyTo ? await resolveNote((0, _type.getOneApId)(note.inReplyTo), resolver).then((x)=>{
        if (x == null) {
            logger.warn(`Specified inReplyTo, but not found`);
            throw new Error('inReplyTo not found');
        } else {
            return x;
        }
    }).catch(async (e)=>{
        logger.warn(`Error in inReplyTo reply:${note.inReplyTo} - ${e.statusCode || e}`);
        replyError = true;
        return null;
    }) : null;
    if (replyError) return null;
    // 引用
    let quote;
    if (note._misskey_quote || note.quoteUri || note.quoteUrl) {
        const tryResolveNote = async (uri)=>{
            if (typeof uri !== 'string' || !uri.match(/^https?:/)) return {
                status: 'permerror'
            };
            try {
                const res = await resolveNote(uri);
                if (res) {
                    return {
                        status: 'ok',
                        res
                    };
                } else {
                    return {
                        status: 'permerror'
                    };
                }
            } catch (e) {
                return {
                    status: e instanceof _fetch.StatusError && e.isClientError ? 'permerror' : 'temperror'
                };
            }
        };
        const uris = (0, _array.unique)([
            note._misskey_quote,
            note.quoteUri,
            note.quoteUrl
        ].filter((x)=>typeof x === 'string'));
        const results = await Promise.all(uris.map((uri)=>tryResolveNote(uri)));
        quote = results.filter((x)=>x.status === 'ok').map((x)=>x.res).find((x)=>x);
        if (!quote) {
            logger.warn(`Error in quote note:${note.id}`);
            return null;
        }
    }
    // 参照
    let references = [];
    if (note.references) {
        references = await fetchReferences(note.references, resolver).catch((e)=>{
            return [];
        });
    }
    const cw = note.summary === '' ? null : note.summary;
    // テキストのパース
    const text = note._misskey_content || (note.content ? (0, _htmltomfm.htmlToMfm)(note.content, note.tag) : null);
    // vote
    if (reply && reply.poll) {
        const tryCreateVote = async (name, index)=>{
            if (reply.poll.expiresAt && Date.now() > new Date(reply.poll.expiresAt).getTime()) {
                logger.warn(`vote to expired poll from AP: actor=${actor.username}@${actor.host}, note=${note.id}, choice=${name}`);
            } else if (index >= 0) {
                logger.info(`vote from AP: actor=${actor.username}@${actor.host}, note=${note.id}, choice=${name}`);
                await (0, _vote.default)(actor, reply, index);
                // リモートフォロワーにUpdate配信
                (0, _update.deliverQuestionUpdate)(reply._id);
            }
            return null;
        };
        if (note.name) {
            return await tryCreateVote(note.name, reply.poll.choices.findIndex((x)=>x.text === note.name));
        }
    }
    const emojis = await extractEmojis(note.tag || [], actor.host).catch((e)=>{
        logger.info(`extractEmojis: ${e}`);
        return [];
    });
    const apEmojis = emojis.map((emoji)=>emoji.name);
    const poll = await (0, _question.extractPollFromQuestion)(note, resolver).catch(()=>undefined);
    // ユーザーの情報が古かったらついでに更新しておく
    if (actor.lastFetchedAt == null || Date.now() - actor.lastFetchedAt.getTime() > 1000 * 60 * 60 * 6) {
        (0, _person.updatePerson)(actor.uri);
    }
    return await (0, _create.default)(actor, {
        createdAt: (0, _date.parseDateWithLimit)(note.published, 600 * 1000) || new Date(),
        files,
        reply,
        renote: quote,
        name: note.name,
        cw,
        text,
        viaMobile: false,
        localOnly: false,
        geo: undefined,
        visibility,
        visibleUsers,
        apMentions,
        apHashtags,
        apEmojis,
        poll,
        uri: note.id,
        url: (0, _type.getOneApHrefNullable)(note.url),
        references
    }, silent);
}
async function resolveNote(value, resolver, timeline = false) {
    const uri = (0, _type.getApId)(value);
    // ブロックしてたら中断
    if (await (0, _instancemoderation.isBlockedHost)((0, _converthost.extractApHost)(uri))) throw new _fetch.StatusError('Blocked instance', 451, 'Blocked instance');
    const unlock = await (0, _applock.getApLock)(uri);
    try {
        //#region このサーバーに既に登録されていたらそれを返す
        const exist = await fetchNote(uri);
        if (exist) {
            return exist;
        }
        //#endregion
        if (uri.startsWith(_config.default.url)) {
            throw new _fetch.StatusError('cannot resolve local note', 400, 'cannot resolve local note');
        }
        // リモートサーバーからフェッチしてきて登録
        // ここでuriの代わりに添付されてきたNote Objectが指定されていると、サーバーフェッチを経ずにノートが生成されるが
        // 添付されてきたNote Objectは偽装されている可能性があるため、常にuriを指定してサーバーフェッチを行う。
        return await createNote(uri, resolver, !!timeline);
    } finally{
        unlock();
    }
}
async function extractEmojis(tags, host_) {
    const host = (0, _.toUnicode)(host_.toLowerCase());
    const eomjiTags = (0, _array.toArray)(tags).filter(_type.isEmoji);
    return await Promise.all(eomjiTags.map(async (tag)=>{
        const name = tag.name.replace(/^:/, '').replace(/:$/, '');
        tag.icon = (0, _array.toSingle)(tag.icon);
        let exists = await _emoji.default.findOne({
            host,
            name
        });
        if (exists) {
            // 更新されていたら更新
            const updated = (0, _date.parseDate)(tag.updated);
            if (updated != null && exists.updatedAt == null || tag.id != null && exists.uri == null || updated != null && exists.updatedAt != null && updated > exists.updatedAt) {
                logger.info(`update emoji host=${host}, name=${name}`);
                exists = await _emoji.default.findOneAndUpdate({
                    host,
                    name
                }, {
                    $set: {
                        uri: tag.id,
                        url: tag.icon.url,
                        saved: false,
                        updatedAt: new Date()
                    }
                });
            }
            await (0, _emojistore.tryStockEmoji)(exists).catch(()=>{});
            return exists;
        }
        logger.info(`register emoji host=${host}, name=${name}`);
        const emoji = await _emoji.default.insert({
            host,
            name,
            uri: tag.id,
            url: tag.icon.url,
            updatedAt: tag.updated ? new Date(tag.updated) : undefined,
            aliases: []
        });
        await (0, _emojistore.tryStockEmoji)(emoji).catch(()=>{});
        return emoji;
    }));
}
async function fetchReferences(src, resolver) {
    // get root
    const root = await resolver.resolve(src);
    // get firstPage
    let page;
    if ((0, _type.isCollection)(root) && root.first) {
        const t = await resolver.resolve(root.first);
        if ((0, _type.isCollectionPage)(t)) {
            page = t;
        } else {
            throw 'cant find firstPage';
        }
    }
    const references = [];
    // Page再帰
    for(let i = 0; i < 100; i++){
        var _page;
        if (!((_page = page) === null || _page === void 0 ? void 0 : _page.items)) throw 'page not have items';
        for (const item of page.items){
            const post = await resolveNote((0, _type.getApId)(item)).catch(()=>null); // 他鯖のオブジェクトが本物かわからないのでstring => uri => resolve
            if (post) {
                references.push(post);
                if (references.length > 100) throw 'too many references';
            } else {
            // not post
            }
        }
        if (page.next) {
            const t = await resolver.resolve(page.next);
            if ((0, _type.isCollectionPage)(t)) {
                page = t;
            } else {
                throw 'cant find next';
            }
        } else {
            return references;
        }
    }
    return [];
}

//# sourceMappingURL=note.js.map
