// tslint:disable: use-type-alias
"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    getPushNotificationsValue: function() {
        return getPushNotificationsValue;
    },
    isLocalUser: function() {
        return isLocalUser;
    },
    isRemoteUser: function() {
        return isRemoteUser;
    },
    validateUsername: function() {
        return validateUsername;
    },
    validatePassword: function() {
        return validatePassword;
    },
    isValidName: function() {
        return isValidName;
    },
    isValidDescription: function() {
        return isValidDescription;
    },
    isValidLocation: function() {
        return isValidLocation;
    },
    isValidBirthday: function() {
        return isValidBirthday;
    },
    getBlocks: function() {
        return getBlocks;
    },
    getMute: function() {
        return getMute;
    },
    getRelation: function() {
        return getRelation;
    },
    pack: function() {
        return pack;
    },
    fetchProxyAccount: function() {
        return fetchProxyAccount;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _note = require("./note");
const _following = require("./following");
const _blocking = require("./blocking");
const _mute = require("./mute");
const _config = require("../config");
const _followrequest = require("./follow-request");
const _fetchmeta = require("../misc/fetch-meta");
const _packemojis = require("../misc/pack-emojis");
const _logger = require("../db/logger");
const _drivefile = require("./drive-file");
const _getdrivefileurl = require("../misc/get-drive-file-url");
const _userfilter = require("./user-filter");
const _cafyid = require("../misc/cafy-id");
const _usertag = require("./usertag");
const _registerorfetchinstancedoc = require("../services/register-or-fetch-instance-doc");
const _converthost = require("../misc/convert-host");
const _awaitall = require("../prelude/await-all");
const _oid = require("../prelude/oid");
const _packutils = require("../misc/pack-utils");
const _sanitizeurl = require("../misc/sanitize-url");
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
const User = _mongodb1.default.get('users');
User.createIndex('createdAt');
User.createIndex('updatedAt');
User.createIndex('lastActivityAt');
User.createIndex('followersCount');
User.createIndex('tags');
User.createIndex('isSuspended');
User.createIndex('username');
User.createIndex('usernameLower');
User.createIndex('host');
User.createIndex([
    'username',
    'host'
], {
    unique: true
});
User.createIndex([
    'usernameLower',
    'host'
], {
    unique: true
});
User.createIndex('token', {
    sparse: true,
    unique: true
});
User.createIndex('uri', {
    sparse: true,
    unique: true
});
const _default = User;
function getPushNotificationsValue(pushNotifications, key) {
    if (pushNotifications == null) return true;
    const value = pushNotifications[key];
    if (value == null) return true;
    return value;
}
const isLocalUser = (user)=>user.host === null;
const isRemoteUser = (user)=>!isLocalUser(user);
function validateUsername(username) {
    return typeof username == 'string' && /^\w{1,20}$/.test(username);
}
function validatePassword(password) {
    return typeof password == 'string' && password != '';
}
function isValidName(name) {
    return name === null || typeof name == 'string' && name.length < 50 && name.trim() != '';
}
function isValidDescription(description) {
    return typeof description == 'string' && description.length < 500 && description.trim() != '';
}
function isValidLocation(location) {
    return typeof location == 'string' && location.length < 50 && location.trim() != '';
}
function isValidBirthday(birthday) {
    // eslint-disable-next-line no-useless-escape
    return typeof birthday == 'string' && /^([0-9]{4,8})\-([0-9]{2})-([0-9]{2})$/.test(birthday);
}
async function getBlocks(userId, otherId) {
    return await _blocking.default.find({
        $or: [
            {
                blockerId: (0, _cafyid.transform)(userId),
                blockeeId: (0, _cafyid.transform)(otherId)
            },
            {
                blockerId: (0, _cafyid.transform)(otherId),
                blockeeId: (0, _cafyid.transform)(userId)
            }
        ]
    });
}
async function getMute(muterId, muteeId) {
    return await _mute.default.findOne({
        muterId: (0, _cafyid.transform)(muterId),
        muteeId: (0, _cafyid.transform)(muteeId),
        $or: [
            {
                expiresAt: null
            },
            {
                expiresAt: {
                    $lt: new Date()
                }
            }
        ]
    });
}
async function getRelation(me, target) {
    var _filter;
    const [following, followed, followReqFromYou, followReqToYou, blocking, blocked, muted, filter] = await Promise.all([
        _following.default.count({
            followerId: me,
            followeeId: target
        }, {
            limit: 1
        }),
        _following.default.count({
            followerId: target,
            followeeId: me
        }, {
            limit: 1
        }),
        _followrequest.default.count({
            followerId: me,
            followeeId: target
        }, {
            limit: 1
        }),
        _followrequest.default.count({
            followerId: target,
            followeeId: me
        }, {
            limit: 1
        }),
        _blocking.default.count({
            blockerId: me,
            blockeeId: target
        }, {
            limit: 1
        }),
        _blocking.default.count({
            blockerId: target,
            blockeeId: me
        }, {
            limit: 1
        }),
        _mute.default.count({
            muterId: me,
            muteeId: target,
            $or: [
                {
                    expiresAt: null
                },
                {
                    expiresAt: {
                        $gt: new Date()
                    }
                }
            ]
        }, {
            limit: 1
        }),
        _userfilter.default.findOne({
            ownerId: me,
            targetId: target
        })
    ]);
    return {
        id: target,
        isFollowing: following > 0,
        isFollowed: followed > 0,
        hasPendingFollowRequestFromYou: followReqFromYou > 0,
        hasPendingFollowRequestToYou: followReqToYou > 0,
        isBlocking: blocking > 0,
        isBlocked: blocked > 0,
        isMuted: muted > 0,
        isHideRenoting: !!((_filter = filter) === null || _filter === void 0 ? void 0 : _filter.hideRenote)
    };
}
async function pack(src, me, options) {
    var _db_profile, _db_profile1, _db_twitter, _db_twitter1, _db_github, _db_github1, _db_discord, _db_discord1, _db_discord2, _db_discord3, _db_settings;
    const opts = Object.assign({
        detail: false,
        includeSecrets: false
    }, options);
    let db;
    // Populate the user if 'user' is ID
    if ((0, _isobjectid.default)(src)) {
        db = await User.findOne({
            _id: src
        });
    } else if (typeof src === 'string') {
        db = await User.findOne({
            _id: new _mongodb.ObjectID(src)
        });
    } else {
        db = _deepcopy(src);
    }
    // (データベースの欠損などで)ユーザーがデータベース上に見つからなかったとき
    if (db == null) {
        _logger.dbLogger.warn(`user not found on database: ${src}`);
        return null;
    }
    // Me
    const meId = me ? (0, _isobjectid.default)(me) ? me : typeof me === 'string' ? new _mongodb.ObjectID(me) : me._id : null;
    const fetchInstance = async ()=>{
        var _instance, _instance1, _instance2, _instance3, _instance4;
        if (db.host == null) return null;
        const info = {
            host: null,
            name: null,
            softwareName: null,
            softwareVersion: null,
            iconUrl: null,
            themeColor: null
        };
        const instance = await (0, _registerorfetchinstancedoc.registerOrFetchInstanceDoc)(db.host);
        info.host = (0, _converthost.toApHost)(db.host);
        info.name = ((_instance = instance) === null || _instance === void 0 ? void 0 : _instance.name) || null;
        info.softwareName = ((_instance1 = instance) === null || _instance1 === void 0 ? void 0 : _instance1.softwareName) || null;
        info.softwareVersion = ((_instance2 = instance) === null || _instance2 === void 0 ? void 0 : _instance2.softwareVersion) || null;
        info.iconUrl = ((_instance3 = instance) === null || _instance3 === void 0 ? void 0 : _instance3.iconUrl) || null;
        info.themeColor = ((_instance4 = instance) === null || _instance4 === void 0 ? void 0 : _instance4.themeColor) || null;
        return info;
    };
    const relation = meId && !(0, _oid.oidEquals)(meId, db._id) && opts.detail ? await getRelation(meId, db._id) : null; // TODO
    const visibleFollowers = (()=>{
        var _relation;
        if (meId && (0, _oid.oidEquals)(meId, db._id)) return true;
        if (db.hideFollows === '') return true;
        if (db.hideFollows === 'always') return false;
        if ((_relation = relation) === null || _relation === void 0 ? void 0 : _relation.isFollowing) return true;
        return false;
    })();
    const populateUserTags = async ()=>{
        var _usertag1;
        if (!meId) return undefined;
        const usertag = await _usertag.default.findOne({
            ownerId: meId,
            targetId: db._id
        });
        return ((_usertag1 = usertag) === null || _usertag1 === void 0 ? void 0 : _usertag1.tags) || [];
    };
    const packed = await (0, _awaitall.awaitAll)(_object_spread({
        id: (0, _packutils.toOidString)(db._id),
        username: db.username,
        name: db.name || null,
        host: db.host,
        avatarUrl: db.avatarId ? _drivefile.default.findOne({
            _id: db.avatarId
        }).then((file)=>(0, _sanitizeurl.sanitizeUrl)((0, _getdrivefileurl.default)(file, true)) || `${_config.default.driveUrl}/default-avatar.jpg`) : `${_config.default.driveUrl}/default-avatar.jpg`,
        avatarColor: null,
        isAdmin: !!db.isAdmin,
        isVerified: !!db.isVerified,
        isBot: !!db.isBot,
        isCat: !!db.isCat,
        borderColor: db.borderColor,
        instance: fetchInstance(),
        // カスタム絵文字添付
        emojis: db.emojis ? (0, _packemojis.packEmojis)(db.emojis, db.host).catch((e)=>{
            console.warn(e);
            return [];
        }) : [],
        avoidSearchIndex: !!db.avoidSearchIndex,
        tags: db.tags || [],
        url: isRemoteUser(db) ? (0, _sanitizeurl.sanitizeUrl)(db.url) || null : null,
        uri: isRemoteUser(db) ? (0, _sanitizeurl.sanitizeUrl)(db.uri) || null : null
    }, opts.detail ? _object_spread({
        createdAt: (0, _packutils.toISODateOrNull)(db.createdAt),
        updatedAt: (0, _packutils.toISODateOrNull)(db.updatedAt),
        bannerUrl: db.bannerUrl ? _drivefile.default.findOne({
            _id: db.bannerId
        }).then((file)=>(0, _sanitizeurl.sanitizeUrl)((0, _getdrivefileurl.default)(file, false)) || null) : null,
        bannerColor: null,
        isLocked: !!db.isLocked,
        isSilenced: !!db.isSilenced,
        isSuspended: !!db.isSuspended,
        isDeleted: !!db.isDeleted,
        description: db.description || null,
        profile: {
            birthday: ((_db_profile = db.profile) === null || _db_profile === void 0 ? void 0 : _db_profile.birthday) || null,
            location: ((_db_profile1 = db.profile) === null || _db_profile1 === void 0 ? void 0 : _db_profile1.location) || null
        },
        fields: db.fields || [],
        followersCount: visibleFollowers || !isLocalUser(db) ? db.followersCount : null,
        followingCount: visibleFollowers || !isLocalUser(db) ? db.followingCount : null,
        notesCount: db.notesCount,
        pinnedNoteIds: db.pinnedNoteIds ? db.pinnedNoteIds.map(_packutils.toOidString) : [],
        pinnedNotes: (0, _note.packMany)(db.pinnedNoteIds || [], meId, {
            removeError: true,
            detail: true
        }),
        movedToUser: db.movedToUserId ? pack(db.movedToUserId) : null,
        usertags: populateUserTags()
    }, isLocalUser(db) ? {
        isModerator: !!db.isModerator,
        twoFactorEnabled: !!db.twoFactorEnabled,
        twitter: db.twitter ? {
            screenName: (_db_twitter = db.twitter) === null || _db_twitter === void 0 ? void 0 : _db_twitter.screenName,
            userId: (_db_twitter1 = db.twitter) === null || _db_twitter1 === void 0 ? void 0 : _db_twitter1.userId
        } : null,
        github: db.github ? {
            id: (_db_github = db.github) === null || _db_github === void 0 ? void 0 : _db_github.id,
            login: (_db_github1 = db.github) === null || _db_github1 === void 0 ? void 0 : _db_github1.login
        } : null,
        discord: db.discord ? {
            id: (_db_discord = db.discord) === null || _db_discord === void 0 ? void 0 : _db_discord.id,
            global_name: (_db_discord1 = db.discord) === null || _db_discord1 === void 0 ? void 0 : _db_discord1.global_name,
            username: (_db_discord2 = db.discord) === null || _db_discord2 === void 0 ? void 0 : _db_discord2.username,
            discriminator: (_db_discord3 = db.discord) === null || _db_discord3 === void 0 ? void 0 : _db_discord3.discriminator
        } : null
    } : {}) : {}, opts.detail && meId && (0, _oid.oidEquals)(meId, db._id) && isLocalUser(db) ? {
        avatarId: (0, _packutils.toOidStringOrNull)(db.avatarId),
        bannerId: (0, _packutils.toOidStringOrNull)(db.bannerId),
        alwaysMarkNsfw: !!((_db_settings = db.settings) === null || _db_settings === void 0 ? void 0 : _db_settings.alwaysMarkNsfw),
        carefulBot: !!db.carefulBot,
        carefulRemote: !!db.carefulRemote,
        carefulMassive: !!db.carefulMassive,
        refuseFollow: !!db.refuseFollow,
        autoAcceptFollowed: !!db.autoAcceptFollowed,
        isExplorable: !!db.isExplorable,
        searchableBy: db.searchableBy || 'public',
        hideFollows: db.hideFollows || '',
        wallpaperId: (0, _packutils.toOidStringOrNull)(db.wallpaperId),
        wallpaperUrl: (0, _sanitizeurl.sanitizeUrl)(db.wallpaperUrl) || null,
        hasUnreadMessagingMessage: !!db.hasUnreadMessagingMessage,
        hasUnreadNotification: !!db.hasUnreadNotification,
        hasUnreadSpecifiedNotes: !!db.hasUnreadSpecifiedNotes,
        hasUnreadMentions: !!db.hasUnreadMentions,
        pendingReceivedFollowRequestsCount: db.pendingReceivedFollowRequestsCount || 0
    } : {}, opts.includeSecrets && meId && (0, _oid.oidEquals)(meId, db._id) && isLocalUser(db) ? {
        email: db.email || null,
        emailVerified: !!db.emailVerified,
        clientSettings: db.clientSettings,
        settings: db.settings
    } : {}, relation ? {
        isFollowing: relation.isFollowing,
        isFollowed: relation.isFollowed,
        hasPendingFollowRequestFromYou: relation.hasPendingFollowRequestFromYou,
        hasPendingFollowRequestToYou: relation.hasPendingFollowRequestToYou,
        isBlocking: relation.isBlocking,
        isBlocked: relation.isBlocked,
        isMuted: relation.isMuted,
        isHideRenoting: relation.isHideRenoting
    } : {}));
    return packed;
}
async function fetchProxyAccount() {
    const meta = await (0, _fetchmeta.default)();
    return await User.findOne({
        username: meta.proxyAccount,
        host: null
    });
}

//# sourceMappingURL=user.js.map
