"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    fetchPerson: function() {
        return fetchPerson;
    },
    createPerson: function() {
        return createPerson;
    },
    updatePerson: function() {
        return updatePerson;
    },
    resolvePerson: function() {
        return resolvePerson;
    },
    analyzeAttachments: function() {
        return analyzeAttachments;
    },
    updateFeatured: function() {
        return updateFeatured;
    },
    fetchOutbox: function() {
        return fetchOutbox;
    },
    exportedForTesting: function() {
        return exportedForTesting;
    }
});
const _promiselimit = require("promise-limit");
const _ = require("punycode/");
const _cafy = require("cafy");
const _config = require("../../../config");
const _user = require("../../../models/user");
const _resolver = require("../resolver");
const _image = require("./image");
const _type = require("../type");
const _meta = require("../../../models/meta");
const _fromhtml = require("../../../mfm/from-html");
const _htmltomfm = require("../misc/html-to-mfm");
const _users = require("../../../services/chart/users");
const _instance = require("../../../services/chart/instance");
const _url = require("url");
const _note = require("./note");
const _registerorfetchinstancedoc = require("../../../services/register-or-fetch-instance-doc");
const _instance1 = require("../../../models/instance");
const _getdrivefileurl = require("../../../misc/get-drive-file-url");
const _tag = require("./tag");
const _following = require("../../../models/following");
const _logger = require("../logger");
const _updatehashtag = require("../../../services/update-hashtag");
const _array = require("../../../prelude/array");
const _updateinstanceinfo = require("../../../services/update-instanceinfo");
const _converthost = require("../../../misc/convert-host");
const _dbresolver = require("../db-resolver");
const _resolveuser = require("../../resolve-user");
const _normalizetag = require("../../../misc/normalize-tag");
const _stringz = require("stringz");
const _resolveanotheruser = require("../resolve-another-user");
const _fetch = require("../../../misc/fetch");
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
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const logger = _logger.apLogger;
const MAX_NAME_LENGTH = 512;
const MAX_SUMMARY_LENGTH = 8192;
const truncate = (value, maxLength)=>{
    return (0, _stringz.substr)(value, 0, maxLength);
};
/**
 * Validate and convert to actor object
 * @param x Fetched object
 * @param uri Fetch target URI
 */ function validateActor(x, uri) {
    const expectHost = (0, _.toUnicode)(new _url.URL(uri).hostname.toLowerCase());
    if (x == null) {
        throw new Error('invalid Actor: object is null');
    }
    if (!(0, _type.isActor)(x)) {
        throw new Error(`invalid Actor type '${x.type}'`);
    }
    const validate = (name, value, validater)=>{
        const e = validater.test(value);
        if (e) throw new Error(`invalid Actor: ${name} ${e.message}`);
    };
    validate('id', x.id, _cafy.default.str.min(1));
    validate('inbox', x.inbox, _cafy.default.str.min(1));
    validate('preferredUsername', x.preferredUsername, _cafy.default.str.min(1).max(128).match(/^\w([\w-.]*\w)?$/));
    validate('name', x.name, _cafy.default.optional.nullable.str);
    validate('summary', x.summary, _cafy.default.optional.nullable.str);
    // サロゲートペアは2文字としてカウントされるので、サロゲートペアと合字を考慮して大きめにしておく
    validate('name', x.name, _cafy.default.optional.nullable.str.max(512));
    // 入力値はHTMLなので大きめにしておく
    validate('summary', x.summary, _cafy.default.optional.nullable.str.max(8192));
    const idHost = (0, _.toUnicode)(new _url.URL(x.id).hostname.toLowerCase());
    if (idHost !== expectHost) {
        throw new Error('invalid Actor: id has different host');
    }
    if (x.publicKey) {
        if (typeof x.publicKey.id !== 'string') {
            throw new Error('invalid Actor: publicKey.id is not a string');
        }
        const publicKeyIdHost = (0, _.toUnicode)(new _url.URL(x.publicKey.id).hostname.toLowerCase());
        if (publicKeyIdHost !== expectHost) {
            throw new Error('invalid Actor: publicKey.id has different host');
        }
    }
    return x;
}
async function fetchPerson(uri) {
    if (typeof uri !== 'string') throw 'uri is not string';
    const dbResolver = new _dbresolver.default();
    return await dbResolver.getUserFromApId(uri);
}
async function createPerson(uri, resolver) {
    var _person_vcardbday;
    if (typeof uri !== 'string') throw 'uri is not string';
    if (uri.startsWith(_config.default.url)) {
        throw new _fetch.StatusError('cannot resolve local user', 400, 'cannot resolve local user');
    }
    if (resolver == null) resolver = new _resolver.default();
    const object = await resolver.resolve(uri);
    const person = validateActor(object, uri);
    logger.info(`Creating the Person: ${person.id}`);
    const [followersCount = 0, followingCount = 0, notesCount = 0] = await Promise.all([
        getCollectionCount(person.followers, resolver).catch(()=>undefined),
        getCollectionCount(person.following, resolver).catch(()=>undefined),
        getCollectionCount(person.outbox, resolver).catch(()=>undefined)
    ]);
    const host = (0, _.toUnicode)(new _url.URL((0, _type.getApId)(object)).hostname.toLowerCase());
    const { fields, services } = analyzeAttachments(person.attachment);
    const tags = (0, _tag.extractApHashtags)(person.tag).map((tag)=>(0, _normalizetag.normalizeTag)(tag)).splice(0, 64);
    const movedTo = person.id && person.movedTo ? await (0, _resolveanotheruser.resolveAnotherUser)(person.id, person.movedTo, resolver).catch((e)=>{
        logger.warn(`Error in movedTo: ${e}`);
        return null;
    }) : null;
    const bday = (_person_vcardbday = person['vcard:bday']) === null || _person_vcardbday === void 0 ? void 0 : _person_vcardbday.match(/^[0-9]{4,8}-\d{2}-\d{2}/);
    // Create user
    let user;
    try {
        var _movedTo;
        user = await _user.default.insert(_object_spread_props(_object_spread({
            avatarId: null,
            bannerId: null,
            createdAt: new Date(),
            lastFetchedAt: new Date(),
            description: person.summary ? (0, _htmltomfm.htmlToMfm)(truncate(person.summary, MAX_SUMMARY_LENGTH), person.tag) : '',
            followersCount,
            followingCount,
            notesCount,
            name: person.name ? truncate(person.name, MAX_NAME_LENGTH) : person.name,
            isLocked: person.manuallyApprovesFollowers,
            isExplorable: !!person.discoverable,
            searchableBy: parseSearchableBy(person),
            username: person.preferredUsername,
            usernameLower: person.preferredUsername.toLowerCase(),
            host,
            publicKey: person.publicKey ? {
                id: person.publicKey.id,
                publicKeyPem: person.publicKey.publicKeyPem
            } : undefined,
            inbox: person.inbox,
            sharedInbox: person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined),
            outbox: person.outbox,
            featured: person.featured,
            endpoints: person.endpoints,
            uri: person.id,
            movedToUserId: ((_movedTo = movedTo) === null || _movedTo === void 0 ? void 0 : _movedTo._id) || null,
            url: (0, _type.getOneApHrefNullable)(person.url),
            fields
        }, services), {
            tags,
            profile: {
                birthday: bday ? bday[0] : undefined,
                location: person['vcard:Address'] || undefined
            },
            isBot: (0, _type.getApType)(object) === 'Service',
            isGroup: (0, _type.getApType)(object) === 'Group',
            isOrganization: (0, _type.getApType)(object) === 'Organization',
            isCat: person.isCat === true
        }));
    } catch (e) {
        // duplicate key error
        if (e.code === 11000) {
            // 同じ@username@host を持つものがあった場合、被った先を返す
            const u = await _user.default.findOne({
                uri: {
                    $ne: person.id
                },
                usernameLower: person.preferredUsername.toLowerCase(),
                host
            });
            if (u) {
                throw {
                    code: 'DUPLICATED_USERNAME',
                    with: u
                };
            }
            logger.error(e);
            throw e;
        } else {
            logger.error(e);
            throw e;
        }
    }
    // Register host
    (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(host).then((i)=>{
        _instance1.default.update({
            _id: i._id
        }, {
            $inc: {
                usersCount: 1
            }
        });
        (0, _updateinstanceinfo.UpdateInstanceinfo)(i);
        _instance.default.newUser(i.host);
    });
    //#region Increment users count
    _meta.default.update({}, {
        $inc: {
            'stats.usersCount': 1
        }
    }, {
        upsert: true
    });
    _users.default.update(user, true);
    //#endregion
    // ハッシュタグ更新
    (0, _updatehashtag.updateUsertags)(user, tags);
    //#region アイコンとヘッダー画像をフェッチ
    const [avatar, banner] = await Promise.all([
        fetchImage(user, person.icon).catch(()=>null),
        fetchImage(user, person.image).catch(()=>null)
    ]);
    const avatarId = avatar ? avatar._id : null;
    const bannerId = banner ? banner._id : null;
    const avatarUrl = (0, _getdrivefileurl.default)(avatar, true);
    const bannerUrl = (0, _getdrivefileurl.default)(banner, false);
    const avatarColor = null;
    const bannerColor = null;
    await _user.default.update({
        _id: user._id
    }, {
        $set: {
            avatarId,
            bannerId,
            avatarUrl,
            bannerUrl,
            avatarColor,
            bannerColor
        }
    });
    user.avatarId = avatarId;
    user.bannerId = bannerId;
    user.avatarUrl = avatarUrl;
    user.bannerUrl = bannerUrl;
    user.avatarColor = avatarColor;
    user.bannerColor = bannerColor;
    //#endregion
    //#region カスタム絵文字取得
    const emojis = await (0, _note.extractEmojis)(person.tag || [], host).catch((e)=>{
        logger.info(`extractEmojis: ${e}`);
        return [];
    });
    const emojiNames = emojis.map((emoji)=>emoji.name);
    await _user.default.update({
        _id: user._id
    }, {
        $set: {
            emojis: emojiNames
        }
    });
    //#endregion
    await updateFeatured(user._id, resolver).catch((err)=>logger.error(err));
    return user;
}
async function updatePerson(uri, resolver, hint) {
    var _person_vcardbday, _movedTo;
    if (typeof uri !== 'string') throw 'uri is not string';
    // URIがこのサーバーを指しているならスキップ
    if (uri.startsWith(_config.default.url + '/')) {
        return;
    }
    //#region このサーバーに既に登録されているか
    const exist = await _user.default.findOne({
        uri
    });
    if (exist == null) {
        return;
    }
    //#endregion
    if (resolver == null) resolver = new _resolver.default();
    const object = hint || await resolver.resolve(uri);
    const person = validateActor(object, uri);
    logger.info(`Updating the Person: ${person.id}`);
    const [followersCount = 0, followingCount = 0, notesCount = 0] = await Promise.all([
        getCollectionCount(person.followers, resolver).catch(()=>undefined),
        getCollectionCount(person.following, resolver).catch(()=>undefined),
        getCollectionCount(person.outbox, resolver).catch(()=>undefined)
    ]);
    // アイコンとヘッダー画像をフェッチ
    const [avatar, banner] = await Promise.all([
        fetchImage(exist, person.icon).catch(()=>null),
        fetchImage(exist, person.image).catch(()=>null)
    ]);
    // カスタム絵文字取得
    const emojis = await (0, _note.extractEmojis)(person.tag || [], exist.host).catch((e)=>{
        logger.info(`extractEmojis: ${e}`);
        return [];
    });
    const emojiNames = emojis.map((emoji)=>emoji.name);
    const { fields, services } = analyzeAttachments(person.attachment);
    const tags = (0, _tag.extractApHashtags)(person.tag).map((tag)=>(0, _normalizetag.normalizeTag)(tag)).splice(0, 64);
    const movedTo = person.id && person.movedTo ? await (0, _resolveanotheruser.resolveAnotherUser)(person.id, person.movedTo, resolver).catch((e)=>{
        logger.warn(`Error in movedTo: ${e}`);
        return null;
    }) : null;
    const bday = (_person_vcardbday = person['vcard:bday']) === null || _person_vcardbday === void 0 ? void 0 : _person_vcardbday.match(/^[0-9]{4,8}-\d{2}-\d{2}/);
    const updates = _object_spread_props(_object_spread({
        lastFetchedAt: new Date(),
        inbox: person.inbox,
        sharedInbox: person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined),
        outbox: person.outbox,
        featured: person.featured,
        emojis: emojiNames,
        description: person.summary ? (0, _htmltomfm.htmlToMfm)(truncate(person.summary, MAX_SUMMARY_LENGTH), person.tag) : '',
        followersCount,
        followingCount,
        notesCount,
        name: person.name ? truncate(person.name, MAX_NAME_LENGTH) : person.name,
        movedToUserId: ((_movedTo = movedTo) === null || _movedTo === void 0 ? void 0 : _movedTo._id) || null,
        url: (0, _type.getOneApHrefNullable)(person.url),
        endpoints: person.endpoints,
        fields
    }, services), {
        tags,
        profile: {
            birthday: bday ? bday[0] : undefined,
            location: person['vcard:Address'] || undefined
        },
        isBot: (0, _type.getApType)(object) === 'Service',
        isGroup: (0, _type.getApType)(object) === 'Group',
        isOrganization: (0, _type.getApType)(object) === 'Organization',
        isCat: person.isCat === true,
        isLocked: person.manuallyApprovesFollowers,
        isExplorable: !!person.discoverable,
        searchableBy: parseSearchableBy(person),
        publicKey: person.publicKey ? {
            id: person.publicKey.id,
            publicKeyPem: person.publicKey.publicKeyPem
        } : undefined
    });
    if (avatar) {
        updates.avatarId = avatar._id;
        updates.avatarUrl = (0, _getdrivefileurl.default)(avatar, true);
        updates.avatarColor = null;
    }
    if (banner) {
        updates.bannerId = banner._id;
        updates.bannerUrl = (0, _getdrivefileurl.default)(banner, true);
        updates.bannerColor = null;
    }
    // Update user
    await _user.default.update({
        _id: exist._id
    }, {
        $set: updates
    });
    // ハッシュタグ更新
    (0, _updatehashtag.updateUsertags)(exist, tags);
    // 該当ユーザーが既にフォロワーになっていた場合はFollowingもアップデートする
    await _following.default.update({
        followerId: exist._id
    }, {
        $set: {
            '_follower.sharedInbox': person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined)
        }
    }, {
        multi: true
    });
    await updateFeatured(exist._id, resolver).catch((err)=>logger.error(err));
    (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)((0, _converthost.extractDbHost)(uri)).then((i)=>{
        (0, _updateinstanceinfo.UpdateInstanceinfo)(i);
    });
}
async function resolvePerson(uri, verifier, resolver, noResolve = false) {
    if (typeof uri !== 'string') throw 'uri is not string';
    //#region このサーバーに既に登録されていたらそれを返す
    const exist = await fetchPerson(uri);
    if (exist) {
        return exist;
    }
    //#endregion
    if (noResolve) {
        throw new _fetch.StatusError('Resolve skipped', 400, 'Resolve skipped');
    }
    // リモートサーバーからフェッチしてきて登録
    if (resolver == null) resolver = new _resolver.default();
    let user = null;
    try {
        user = await createPerson(uri, resolver);
    } catch (e) {
        if (e.code === 'DUPLICATED_USERNAME') {
            // uriからresolveしたユーザーを作成しようとしたら同じ @username@host が既に存在した場合にここに来る
            const existUser = e.with;
            logger.warn(`Duplicated username. input(uri=${uri}) exist(uri=${existUser.uri} username=${existUser.username}, host=${existUser.host})`);
            // WebFinger(@username@host)からresync をトリガする (24時間以上古い場合)
            (0, _resolveuser.default)(existUser.username, existUser.host);
        }
        throw e;
    }
    return user;
}
const services = {
    'misskey:authentication:twitter': (userId, screenName)=>({
            userId,
            screenName
        }),
    'misskey:authentication:github': (id, login)=>({
            id,
            login
        }),
    'misskey:authentication:discord': (id, name)=>$discord(id, name)
};
const $discord = (id, name)=>{
    if (typeof name !== 'string') name = 'unknown#0000';
    const [username, discriminator] = name.split('#');
    return {
        id,
        username,
        discriminator
    };
};
function addService(target, source) {
    const service = services[source.name];
    if (typeof source.value !== 'string') source.value = 'unknown';
    const [id, username] = source.value.split('@');
    if (service) target[source.name.split(':')[2]] = service(id, username);
}
async function getCollectionCount(value, resolver) {
    if (value == null) return undefined;
    const resolved = await resolver.resolve(value);
    return (0, _type.isCollectionOrOrderedCollection)(resolved) ? resolved.totalItems : undefined;
}
async function fetchImage(actor, value) {
    if (value == null) return null;
    const first = (0, _array.toSingle)(value);
    if (first == null) return null;
    return await (0, _image.resolveImage)(actor, first);
}
function analyzeAttachments(attachments) {
    attachments = (0, _array.toArray)(attachments);
    const fields = [];
    const services = {};
    for (const attachment of attachments.filter(_type.isPropertyValue)){
        if ((0, _type.isPropertyValue)(attachment.identifier)) {
            addService(services, attachment.identifier);
        } else {
            fields.push({
                name: attachment.name,
                value: (0, _fromhtml.fromHtml)(attachment.value) || ''
            });
        }
    }
    return {
        fields,
        services
    };
}
async function updateFeatured(userId, resolver) {
    const user = await _user.default.findOne({
        _id: userId
    });
    if (!(0, _user.isRemoteUser)(user)) return;
    if (!user.featured) return;
    logger.info(`Updating the featured: ${user.uri}`);
    if (resolver == null) resolver = new _resolver.default();
    // Resolve to (Ordered)Collection Object
    const collection = await resolver.resolveCollection(user.featured);
    if (!(0, _type.isCollectionOrOrderedCollection)(collection)) throw new Error(`Object is not Collection or OrderedCollection`);
    // Resolve to Object(may be Note) arrays
    const unresolvedItems = (0, _type.isCollection)(collection) ? collection.items : collection.orderedItems;
    const items = await Promise.all((0, _array.toArray)(unresolvedItems).map((x)=>resolver.resolve(x)));
    // Resolve and regist Notes
    const limit = _promiselimit(2);
    const featuredNotes = await Promise.all(items.filter((item)=>(0, _type.getApType)(item) === 'Note') // TODO: Noteでなくてもいいかも
    .slice(0, 20).map((item)=>limit(()=>(0, _note.resolveNote)(item, resolver))));
    await _user.default.update({
        _id: user._id
    }, {
        $set: {
            pinnedNoteIds: featuredNotes.filter((note)=>note != null).map((note)=>note._id)
        }
    });
}
async function fetchOutbox(user) {
    if (!(0, _user.isRemoteUser)(user)) return;
    if (!user.outbox) {
        logger.debug(`no outbox for ${user.username}@${user.host}`);
        return;
    }
    logger.info(`Updating the outbox: ${user.outbox}`);
    const resolver = new _resolver.default();
    // Fetch activities from outbox (first page only)
    let unresolvedActivities;
    const collection = await resolver.resolveCollection(user.outbox);
    if (!(0, _type.isOrderedCollection)(collection)) throw new Error(`Object is not an OrderedCollection`);
    if (collection.orderedItems) {
        unresolvedActivities = collection.orderedItems;
    } else if (collection.first) {
        const page = await resolver.resolveCollection(collection.first);
        if ((0, _type.isOrderedCollectionPage)(page)) {
            unresolvedActivities = page.orderedItems;
        }
    }
    if (!unresolvedActivities) throw new Error('Can not fetch outbox items');
    // Process activities
    let itemCount = 0;
    for (const unresolvedActivity of unresolvedActivities){
        const activity = await resolver.resolve(unresolvedActivity);
        if ((0, _type.isCreate)(activity)) {
            const object = await resolver.resolve(activity.object);
            if ((0, _type.isPost)(object)) {
                // Note
                if (object.inReplyTo) {
                // skip reply
                } else if (object._misskey_quote || object.quoteUri || object.quoteUrl) {
                // skip quote
                } else {
                    if (++itemCount > 10) break;
                    await (0, _note.resolveNote)(object, resolver);
                }
            }
        } else {
        // skip Announce etc
        }
    }
}
function parseSearchableBy(actor) {
    if (actor.searchableBy == null) return null;
    const searchableBy = (0, _array.toArray)(actor.searchableBy);
    if (searchableBy.includes('https://www.w3.org/ns/activitystreams#Public')) return 'public';
    if (searchableBy.includes((0, _type.getApId)(actor.followers))) return 'none';
    return 'none';
}
const exportedForTesting = {
    parseSearchableBy
};

//# sourceMappingURL=person.js.map
