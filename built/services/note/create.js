"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _note = require("../../models/note");
const _user = require("../../models/user");
const _stream = require("../stream");
const _queue = require("../../queue");
const _note1 = require("../../remote/activitypub/renderer/note");
const _create = require("../../remote/activitypub/renderer/create");
const _announce = require("../../remote/activitypub/renderer/announce");
const _renderer = require("../../remote/activitypub/renderer");
const _drivefile = require("../../models/drive-file");
const _createnotification = require("../../services/create-notification");
const _parse = require("../../mfm/parse");
const _resolveuser = require("../../remote/resolve-user");
const _meta = require("../../models/meta");
const _config = require("../../config");
const _updatehashtag = require("../update-hashtag");
const _isquote = require("../../misc/is-quote");
const _notes = require("../../services/chart/notes");
const _perusernotes = require("../../services/chart/per-user-notes");
const _instance = require("../../services/chart/instance");
const _array = require("../../prelude/array");
const _unread = require("./unread");
const _registerorfetchinstancedoc = require("../register-or-fetch-instance-doc");
const _instance1 = require("../../models/instance");
const _extractmentions = require("../../mfm/extract-mentions");
const _extractemojis = require("../../mfm/extract-emojis");
const _extracthashtags = require("../../mfm/extract-hashtags");
const _genid = require("../../misc/gen-id");
const _delivermanager = require("../../remote/activitypub/deliver-manager");
const _relay = require("../relay");
const _mecab = require("../../misc/mecab");
const _following = require("../../models/following");
const _normalizetag = require("../../misc/normalize-tag");
const _ms = require("ms");
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
let NotificationManager = class NotificationManager {
    push(notifiee, reason) {
        // 自分自身へは通知しない
        if (this.notifier._id.equals(notifiee)) return;
        const exist = this.queue.find((x)=>x.target.equals(notifiee) && x.reason == 'reply');
        if (exist) {
            // すでにreplyされている場合は後続のreply, mentionはスキップ
            if (reason == 'mention' || reason == 'reply') {
                return;
            }
        }
        const existMention = this.queue.find((x)=>x.target.equals(notifiee) && x.reason == 'mention');
        if (existMention) {
            if (reason == 'quote') {
                return;
            }
        }
        this.queue.push({
            reason: reason,
            target: notifiee
        });
    }
    async deliver() {
        // サイレンスされていたらスキップ
        if (this.notifier.isSilenced) {
            return;
        }
        for (const x of this.queue){
            // ミュートされてたらスキップ
            const mute = await (0, _user.getMute)(x.target, this.notifier._id);
            if (mute) {
                continue;
            }
            (0, _createnotification.createNotification)(x.target, this.notifier._id, x.reason, {
                noteId: this.note._id
            });
        }
    }
    constructor(notifier, note){
        _define_property(this, "notifier", void 0);
        _define_property(this, "note", void 0);
        _define_property(this, "queue", void 0);
        this.notifier = notifier;
        this.note = note;
        this.queue = [];
    }
};
const _default = async (user, data, silent = false)=>{
    if (_config.default.disablePosts) throw {
        status: 451
    };
    const isFirstNote = user.notesCount === 0;
    const isPureRenote = data.text == null && data.poll == null && (data.files == null || data.files.length == 0);
    if (data.createdAt == null) data.createdAt = new Date();
    if (data.visibility == null) data.visibility = 'public';
    if (data.viaMobile == null) data.viaMobile = false;
    if (data.localOnly == null) data.localOnly = false;
    if (data.copyOnce == null) data.copyOnce = false;
    if (data.visibleUsers) {
        data.visibleUsers = (0, _array.erase)(null, data.visibleUsers);
    }
    // 本文/CW/投票のハードリミット
    // サロゲートペアは2文字扱い/合字は複数文字扱いでかける
    if (data.text && data.text.length > 16384) {
        throw 'text limit exceeded';
    }
    if (data.cw && data.cw.length > 16384) {
        throw 'cw limit exceeded';
    }
    if (data.poll && JSON.stringify(data.poll).length > 16384) {
        throw 'poll limit exceeded';
    }
    if (data.copyOnce && data.visibility === 'specified') {
        throw 'Deny remote follower only';
    }
    // リプライ対象が削除された投稿だったらreject
    if (data.reply && data.reply.deletedAt != null) {
        throw 'Reply target has been deleted';
    }
    // Renote/Quote対象が削除された投稿だったらreject
    if (data.renote && data.renote.deletedAt != null) {
        throw 'Renote target has been deleted';
    }
    // Renote/Quote対象が「ホームまたは全体」以外の公開範囲ならreject
    if (data.renote && data.renote.visibility != 'public' && data.renote.visibility != 'home') {
        throw 'Renote target is not public or home';
    }
    // Renote/Quote対象がホームだったらホームに
    if (data.renote && data.visibility === 'public' && data.renote.visibility === 'home') {
        data.visibility = 'home';
    }
    // PureRenoteの最大公開範囲はHomeにする
    if (isPureRenote && data.visibility === 'public') {
        data.visibility = 'home';
    }
    // ローカルのみをRenoteしたらローカルのみにする
    if (data.renote && data.renote.localOnly) {
        data.localOnly = true;
    }
    // ローカルのみにリプライしたらローカルのみにする
    if (data.reply && data.reply.localOnly) {
        data.localOnly = true;
    }
    if (data.copyOnce && data.localOnly) {
        data.copyOnce = false;
    }
    if (data.text) {
        data.text = data.text.trim();
    }
    let tags = data.apHashtags;
    let emojis = data.apEmojis;
    let mentionedUsers = data.apMentions;
    // Parse MFM if needed
    if (!tags || !emojis || !mentionedUsers) {
        const tokens = data.text ? (0, _parse.parseBasic)(data.text) : [];
        const cwTokens = data.cw ? (0, _parse.parseBasic)(data.cw) : [];
        const choiceTokens = data.poll && data.poll.choices ? (0, _array.concat)(data.poll.choices.map((choice)=>(0, _parse.parseBasic)(choice.text))) : [];
        const combinedTokens = tokens.concat(cwTokens).concat(choiceTokens);
        tags = data.apHashtags || (0, _extracthashtags.extractHashtags)(combinedTokens);
        emojis = data.apEmojis || (0, _extractemojis.extractEmojis)(combinedTokens);
        mentionedUsers = data.apMentions || await extractMentionedUsers(user, combinedTokens);
    }
    tags = tags.filter((tag)=>Array.from(tag || '').length <= 128).splice(0, 64);
    if (data.reply && !user._id.equals(data.reply.userId) && !mentionedUsers.some((u)=>u._id.equals(data.reply.userId))) {
        mentionedUsers.push(await _user.default.findOne({
            _id: data.reply.userId
        }));
    }
    if (data.visibility == 'specified') {
        for (const u of data.visibleUsers){
            if (!mentionedUsers.some((x)=>x._id.equals(u._id))) {
                mentionedUsers.push(u);
            }
        }
        for (const u of mentionedUsers){
            if (!data.visibleUsers.some((x)=>x._id.equals(u._id))) {
                data.visibleUsers.push(u);
            }
        }
    }
    // 時限投稿
    let expireDelay = null;
    if ((0, _user.isLocalUser)(user)) {
        for (const tag of tags){
            const m = tag.match(/^exp(\d{1,6}[smhd])$/);
            if (!m) continue;
            expireDelay = _ms(m[1]);
            if (expireDelay < _ms('5s')) expireDelay = _ms('5s');
            if (expireDelay > _ms('7d')) expireDelay = _ms('7d');
            data.expiresAt = new Date(new Date().getTime() + expireDelay);
            break;
        }
    }
    const note = await insertNote(user, data, tags, emojis, mentionedUsers);
    (async ()=>{
        if (data.preview) return;
        if (note == null) {
            return;
        }
        if (expireDelay) {
            (0, _queue.createDeleteNoteJob)(note, expireDelay);
        }
        // 統計を更新
        _notes.default.update(note, true);
        _perusernotes.default.update(user, note, true);
        // Register host
        if ((0, _user.isRemoteUser)(user)) {
            (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(user.host).then((i)=>{
                _instance1.default.update({
                    _id: i._id
                }, {
                    $inc: {
                        notesCount: 1
                    }
                });
                _instance.default.updateNote(i.host, true);
            });
        }
        // ハッシュタグ更新
        (0, _updatehashtag.updateHashtags)(user, tags);
        // ファイルが添付されていた場合ドライブのファイルの「このファイルが添付された投稿一覧」プロパティにこの投稿を追加
        if (data.files) {
            for (const file of data.files){
                _drivefile.default.update({
                    _id: file._id
                }, {
                    $push: {
                        'metadata.attachedNoteIds': note._id
                    }
                });
            }
        }
        // Increment notes count
        incNotesCount(user);
        // Increment notes count (user)
        incNotesCountOfUser(user);
        // 未読通知を作成
        if (data.visibility == 'specified') {
            for (const u of data.visibleUsers){
                (0, _unread.default)(u, note, true);
            }
        } else {
            for (const u of mentionedUsers){
                (0, _unread.default)(u, note, false);
            }
        }
        if (data.reply) {
            saveReply(data.reply, note);
        }
        if (data.renote) {
            incRenoteCount(data.renote, user);
        }
        if ((0, _isquote.default)(note)) {
            saveQuote(data.renote, note);
            incQuoteCount(data.renote);
        }
        // Pack the note
        const noteObj = await (0, _note.pack)(note);
        if (isFirstNote) {
            noteObj.isFirstNote = true;
        }
        if (note.createdAt.getTime() > new Date().getTime() - 1000 * 60 * 10) {
            (0, _stream.publishNotesStream)(noteObj);
        }
        //publishHotStream(noteObj);
        const nm = new NotificationManager(user, note);
        const nmRelatedPromises = [];
        // Extended notification
        if (note.visibility === 'public' || note.visibility === 'home' || note.visibility === 'followers') {
            nmRelatedPromises.push(notifyExtended(note, nm));
        }
        // If has in reply to note
        if (data.reply) {
            // 通知
            if ((0, _user.isLocalUser)(data.reply._user)) {
                nm.push(data.reply.userId, 'reply');
                (0, _stream.publishMainStream)(data.reply.userId, 'reply', noteObj);
            }
        }
        // mention
        await createMentionedEvents(mentionedUsers, note, nm);
        // If it is renote
        if (data.renote) {
            const type = data.text ? 'quote' : 'renote';
            // Notify
            if ((0, _user.isLocalUser)(data.renote._user)) {
                nm.push(data.renote.userId, type);
            }
            // Publish event
            if (!user._id.equals(data.renote.userId) && (0, _user.isLocalUser)(data.renote._user)) {
                (0, _stream.publishMainStream)(data.renote.userId, 'renote', noteObj);
            }
        }
        Promise.all(nmRelatedPromises).then(()=>{
            nm.deliver();
        });
        // AP deliver
        if ((0, _user.isLocalUser)(user)) {
            (async ()=>{
                let noteActivity;
                if (user.isSilenced && note.visibility === 'public') {
                    const n = Object.assign({}, note);
                    n.visibility = 'home';
                    noteActivity = await renderNoteOrRenoteActivity(data, n, user);
                } else {
                    noteActivity = await renderNoteOrRenoteActivity(data, note, user);
                }
                const dm = new _delivermanager.default(user, noteActivity);
                // メンションされたリモートユーザーに配送
                for (const u of mentionedUsers.filter((u)=>(0, _user.isRemoteUser)(u))){
                    dm.addDirectRecipe(u);
                }
                if (!silent) {
                    // 投稿がリプライかつ投稿者がローカルユーザーかつリプライ先の投稿の投稿者がリモートユーザーなら配送
                    if (data.reply && (0, _user.isRemoteUser)(data.reply._user)) {
                        dm.addDirectRecipe(data.reply._user);
                    }
                    // 投稿がRenoteかつ投稿者がローカルユーザーかつRenote元の投稿の投稿者がリモートユーザーなら配送
                    if (data.renote && (0, _user.isRemoteUser)(data.renote._user)) {
                        dm.addDirectRecipe(data.renote._user);
                    }
                    // フォロワーへ配送
                    if ([
                        'public',
                        'home',
                        'followers'
                    ].includes(note.visibility)) {
                        dm.addFollowersRecipe();
                    }
                    // リレーへ配送
                    if ([
                        'public'
                    ].includes(note.visibility) && !note.copyOnce) {
                        (0, _relay.deliverToRelays)(user, noteActivity);
                    }
                    // リモートのみ配送
                    if (note.visibility === 'specified' && note.copyOnce) {
                        dm.addFollowersRecipe();
                    }
                }
                dm.execute();
            })();
        }
        // Register to search database
        index(note, user);
        if ((0, _user.isLocalUser)(user) && note.poll && note.poll.expiresAt) {
            (0, _queue.createNotifyPollFinishedJob)(note, user, note.poll.expiresAt);
        }
    })();
    return note;
};
async function renderNoteOrRenoteActivity(data, note, user) {
    if (data.localOnly) return null;
    if (user.noFederation) return null;
    const content = data.renote && data.text == null && data.poll == null && (data.files == null || data.files.length == 0) ? (0, _announce.default)(data.renote.uri ? data.renote.uri : `${_config.default.url}/notes/${data.renote._id}`, note) : (0, _create.default)(await (0, _note1.default)(note, false), note);
    return (0, _renderer.renderActivity)(content);
}
function incRenoteCount(renote, user) {
    _note.default.update({
        _id: renote._id
    }, {
        $inc: {
            renoteCount: 1,
            score: user.isBot ? 0 : 1
        }
    });
}
function incQuoteCount(renote) {
    _note.default.update({
        _id: renote._id
    }, {
        $inc: {
            quoteCount: 1
        }
    });
}
async function insertNote(user, data, tags, emojis, mentionedUsers) {
    var _data_references;
    const insert = {
        _id: (0, _genid.genId)(data.createdAt),
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        fileIds: data.files ? data.files.map((file)=>file._id) : [],
        replyId: data.reply ? data.reply._id : null,
        renoteId: data.renote ? data.renote._id : null,
        name: data.name,
        text: data.text,
        poll: data.poll,
        cw: data.cw == null ? null : data.cw,
        tags,
        tagsLower: tags.map((tag)=>(0, _normalizetag.normalizeTag)(tag)),
        emojis,
        userId: user._id,
        viaMobile: data.viaMobile,
        localOnly: data.localOnly,
        copyOnce: data.copyOnce,
        geo: data.geo || null,
        appId: data.app ? data.app._id : null,
        visibility: data.visibility,
        visibleUserIds: data.visibility == 'specified' ? data.visibleUsers ? data.visibleUsers.map((u)=>u._id) : [] : [],
        referenceIds: ((_data_references = data.references) === null || _data_references === void 0 ? void 0 : _data_references.map((x)=>x._id)) || [],
        // 以下非正規化データ
        _reply: data.reply ? {
            userId: data.reply.userId,
            user: {
                host: data.reply._user.host
            }
        } : null,
        _renote: data.renote ? {
            userId: data.renote.userId,
            user: {
                host: data.renote._user.host
            }
        } : null,
        _user: {
            host: user.host,
            inbox: (0, _user.isRemoteUser)(user) ? user.inbox : undefined
        },
        _files: data.files ? data.files : []
    };
    if (data.uri != null) insert.uri = data.uri;
    if (data.url != null) insert.url = data.url;
    // Append mentions data
    if (mentionedUsers.length > 0) {
        insert.mentions = mentionedUsers.map((u)=>u._id);
        insert.mentionedRemoteUsers = mentionedUsers.filter((u)=>(0, _user.isRemoteUser)(u)).map((u)=>({
                uri: u.uri,
                url: u.url,
                username: u.username,
                host: u.host
            }));
    }
    if (data.preview) {
        return Object.assign({
            preview: true
        }, insert);
    }
    // 投稿を作成
    try {
        return await _note.default.insert(insert);
    } catch (e) {
        // duplicate key error
        if (e.code === 11000) {
            return null;
        }
        throw e;
    }
}
function index(note, user) {
    if (note.visibility !== 'public') return;
    if (user.searchableBy != null && user.searchableBy !== 'public') return;
    if (_config.default.mecabSearch) {
        // for search
        (0, _mecab.getIndexer)(note).then((mecabWords)=>{
            console.log(`Index: ${note._id} ${JSON.stringify(mecabWords)}`);
            _note.default.findOneAndUpdate({
                _id: note._id
            }, {
                $set: {
                    mecabWords
                }
            });
        });
        // for trend
        (0, _mecab.getWordIndexer)(note).then((trendWords)=>{
            console.log(`WordIndex: ${note._id} ${JSON.stringify(trendWords)}`);
            _note.default.findOneAndUpdate({
                _id: note._id
            }, {
                $set: {
                    trendWords
                }
            });
        });
    }
}
async function notifyExtended(note, nm) {
    const text = note.text;
    if (!text) return;
    const us = await _user.default.find({
        host: null,
        'clientSettings.highlightedWords': {
            $exists: true
        }
    });
    for (const u of us){
        if (!(0, _user.isLocalUser)(u)) continue;
        if (note.visibility === 'followers') {
            const followings = await _following.default.findOne({
                followerId: u._id,
                followeeId: note.userId
            });
            if (followings == null) return;
        }
        try {
            const words = u.clientSettings.highlightedWords.filter((q)=>q != null && q.length > 0).slice(0, 5);
            const match = words.some((word)=>text.toLowerCase().includes(word.toLowerCase()));
            if (match) {
                nm.push(u._id, 'highlight');
            }
        } catch (e) {
            console.error(e);
        }
    }
}
async function createMentionedEvents(mentionedUsers, note, nm) {
    for (const u of mentionedUsers.filter((u)=>(0, _user.isLocalUser)(u))){
        const detailPackedNote = await (0, _note.pack)(note, u, {
            detail: true
        });
        (0, _stream.publishMainStream)(u._id, 'mention', detailPackedNote);
        // Create notification
        nm.push(u._id, 'mention');
    }
}
function saveQuote(renote, note) {
    _note.default.update({
        _id: renote._id
    }, {
        $push: {
            _quoteIds: note._id
        }
    });
}
function saveReply(reply, note) {
    _note.default.update({
        _id: reply._id
    }, {
        $inc: {
            repliesCount: 1
        }
    });
}
function incNotesCountOfUser(user) {
    _user.default.update({
        _id: user._id
    }, {
        $set: {
            updatedAt: new Date()
        },
        $inc: {
            notesCount: 1
        }
    });
}
function incNotesCount(user) {
    if ((0, _user.isLocalUser)(user)) {
        _meta.default.update({}, {
            $inc: {
                'stats.notesCount': 1,
                'stats.originalNotesCount': 1
            }
        }, {
            upsert: true
        });
    } else {
        _meta.default.update({}, {
            $inc: {
                'stats.notesCount': 1
            }
        }, {
            upsert: true
        });
    }
}
// TODO: parseBasicの結果以外でも入れることが出来てしまう
async function extractMentionedUsers(user, tokens) {
    if (tokens == null) return [];
    const mentions = (0, _extractmentions.extractMentions)(tokens);
    let mentionedUsers = (0, _array.erase)(null, await Promise.all(mentions.map(async (m)=>{
        try {
            return await (0, _resolveuser.default)(m.username, m.host ? m.host : user.host);
        } catch (e) {
            return null;
        }
    })));
    // Drop duplicate users
    mentionedUsers = mentionedUsers.filter((u, i, self)=>i === self.findIndex((u2)=>u._id.equals(u2._id)));
    return mentionedUsers;
}

//# sourceMappingURL=create.js.map
