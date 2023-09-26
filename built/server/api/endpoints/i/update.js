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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _drivefile = require("../../../../models/drive-file");
const _acceptall = require("../../../../services/following/requests/accept-all");
const _update = require("../../../../services/i/update");
const _define = require("../../define");
const _getdrivefileurl = require("../../../../misc/get-drive-file-url");
const _parse = require("../../../../mfm/parse");
const _extractemojis = require("../../../../mfm/extract-emojis");
const _extracthashtags = require("../../../../mfm/extract-hashtags");
const _updatehashtag = require("../../../../services/update-hashtag");
const _error = require("../../error");
const _suspenduser = require("../../../../services/suspend-user");
const _unsuspenduser = require("../../../../services/unsuspend-user");
const _normalizetag = require("../../../../misc/normalize-tag");
const _config = require("../../../../config");
const _calcage = require("../../../../misc/calc-age");
const meta = {
    desc: {
        'ja-JP': 'アカウント情報を更新します。',
        'en-US': 'Update myself'
    },
    tags: [
        'account'
    ],
    requireCredential: true,
    kind: [
        'write:account',
        'account-write',
        'account/write'
    ],
    params: {
        name: {
            validator: _cafy.default.optional.nullable.str.pipe(_user.isValidName),
            desc: {
                'ja-JP': '名前(ハンドルネームやニックネーム)'
            }
        },
        description: {
            validator: _cafy.default.optional.nullable.str.pipe(_user.isValidDescription),
            desc: {
                'ja-JP': 'アカウントの説明や自己紹介'
            }
        },
        location: {
            validator: _cafy.default.optional.nullable.str.pipe(_user.isValidLocation),
            desc: {
                'ja-JP': '住んでいる地域、所在'
            }
        },
        birthday: {
            validator: _cafy.default.optional.nullable.str.pipe(_user.isValidBirthday),
            desc: {
                'ja-JP': '誕生日 (YYYY-MM-DD形式)'
            }
        },
        borderColor: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'borderColor'
            }
        },
        avatarId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': 'アイコンに設定する画像のドライブファイルID'
            }
        },
        bannerId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': 'バナーに設定する画像のドライブファイルID'
            }
        },
        wallpaperId: {
            validator: _cafy.default.optional.nullable.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '壁紙に設定する画像のドライブファイルID'
            }
        },
        isLocked: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '鍵アカウントか否か'
            }
        },
        carefulBot: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'Botからのフォローを承認制にするか'
            }
        },
        carefulRemote: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'リモートからのフォローを承認制にするか'
            }
        },
        carefulMassive: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '大量フォロワーのフォローを承認制にするか'
            }
        },
        autoAcceptFollowed: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'フォローしているユーザーからのフォローリクエストを自動承認するか'
            }
        },
        refuseFollow: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'refuseFollow'
            }
        },
        avoidSearchIndex: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'avoidSearchIndex'
            }
        },
        isExplorable: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'isExplorable'
            }
        },
        searchableBy: {
            validator: _cafy.default.optional.nullable.str.or([
                'public',
                'none'
            ]),
            desc: {
                'ja-JP': 'searchableBy'
            }
        },
        hideFollows: {
            validator: _cafy.default.optional.nullable.str.or([
                '',
                'follower',
                'always'
            ]),
            desc: {
                'ja-JP': 'hide Follow/Follower list'
            }
        },
        noFederation: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'noFederation'
            }
        },
        isBot: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'Botか否か'
            }
        },
        isCat: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '猫か否か'
            }
        },
        autoWatch: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': '投稿の自動ウォッチをするか否か'
            }
        },
        alwaysMarkNsfw: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'アップロードするメディアをデフォルトで「閲覧注意」として設定するか'
            }
        },
        fields: {
            validator: _cafy.default.optional.arr(_cafy.default.object()).range(1, 4),
            desc: {
                'ja-JP': 'fields'
            }
        },
        pushNotifications: {
            validator: _cafy.default.optional.object({
                follow: _cafy.default.optional.bool,
                mention: _cafy.default.optional.bool,
                reply: _cafy.default.optional.bool,
                renote: _cafy.default.optional.bool,
                quote: _cafy.default.optional.bool,
                reaction: _cafy.default.optional.bool,
                poll_vote: _cafy.default.optional.bool,
                poll_finished: _cafy.default.optional.bool,
                highlight: _cafy.default.optional.bool,
                unreadMessagingMessage: _cafy.default.optional.bool
            }),
            desc: {
                'ja-JP': 'オフラインプッシュ通知の対象'
            }
        }
    },
    errors: {
        noSuchAvatar: {
            message: 'No such avatar file.',
            code: 'NO_SUCH_AVATAR',
            id: '539f3a45-f215-4f81-a9a8-31293640207f'
        },
        noSuchBanner: {
            message: 'No such banner file.',
            code: 'NO_SUCH_BANNER',
            id: '0d8f5629-f210-41c2-9433-735831a58595'
        },
        avatarNotAnImage: {
            message: 'The file specified as an avatar is not an image.',
            code: 'AVATAR_NOT_AN_IMAGE',
            id: 'f419f9f8-2f4d-46b1-9fb4-49d3a2fd7191'
        },
        bannerNotAnImage: {
            message: 'The file specified as a banner is not an image.',
            code: 'BANNER_NOT_AN_IMAGE',
            id: '75aedb19-2afd-4e6d-87fc-67941256fa60'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user, app)=>{
    const isSecure = user != null && app == null;
    const updates = {};
    if (ps.name !== undefined) updates.name = ps.name;
    if (ps.description !== undefined) updates.description = ps.description;
    if (ps.location !== undefined) updates['profile.location'] = ps.location;
    if (ps.birthday !== undefined) {
        if (typeof _config.default.minimumAge === 'number' && ps.birthday != null) {
            var _d;
            const d = new Date(ps.birthday);
            if (((_d = d) === null || _d === void 0 ? void 0 : _d.toString()) !== 'Invalid Date') {
                const a = (0, _calcage.calcAge)(d);
                if (a < _config.default.minimumAge && a >= 0) {
                    ps.birthday = null;
                }
            }
        }
        updates['profile.birthday'] = ps.birthday;
    }
    if (ps.borderColor !== undefined) {
        if (typeof ps.borderColor === 'string' && user.isVerified && ps.borderColor.match(/^#[0-9A-Fa-f]{6,8}$/)) {
            updates.borderColor = ps.borderColor;
        } else {
            updates.borderColor = null;
        }
    }
    if (ps.avatarId !== undefined) updates.avatarId = ps.avatarId;
    if (ps.bannerId !== undefined) updates.bannerId = ps.bannerId;
    if (ps.wallpaperId !== undefined) updates.wallpaperId = ps.wallpaperId;
    if (typeof ps.isLocked == 'boolean') updates.isLocked = ps.isLocked;
    if (typeof ps.isBot == 'boolean') updates.isBot = ps.isBot;
    if (typeof ps.carefulBot == 'boolean') updates.carefulBot = ps.carefulBot;
    if (typeof ps.carefulRemote == 'boolean') updates.carefulRemote = ps.carefulRemote;
    if (typeof ps.carefulMassive == 'boolean') updates.carefulMassive = ps.carefulMassive;
    if (typeof ps.refuseFollow == 'boolean') updates.refuseFollow = ps.refuseFollow;
    if (typeof ps.autoAcceptFollowed == 'boolean') updates.autoAcceptFollowed = ps.autoAcceptFollowed;
    if (typeof ps.avoidSearchIndex == 'boolean') updates.avoidSearchIndex = ps.avoidSearchIndex;
    if (typeof ps.isExplorable == 'boolean') updates.isExplorable = ps.isExplorable;
    if (ps.searchableBy !== undefined) updates.searchableBy = ps.searchableBy;
    if (ps.hideFollows !== undefined) updates.hideFollows = ps.hideFollows;
    if (typeof ps.noFederation == 'boolean') updates.noFederation = ps.noFederation;
    if (typeof ps.isCat == 'boolean') updates.isCat = ps.isCat;
    if (typeof ps.autoWatch == 'boolean') updates['settings.autoWatch'] = ps.autoWatch;
    if (typeof ps.alwaysMarkNsfw == 'boolean') updates['settings.alwaysMarkNsfw'] = ps.alwaysMarkNsfw;
    if (ps.pushNotifications) updates['settings.pushNotifications'] = ps.pushNotifications;
    if (ps.avatarId) {
        var _avatar_metadata;
        const avatar = await _drivefile.default.findOne({
            _id: ps.avatarId
        });
        if (avatar == null) throw new _error.ApiError(meta.errors.noSuchAvatar);
        if (!avatar.contentType.startsWith('image/')) throw new _error.ApiError(meta.errors.avatarNotAnImage);
        if ((_avatar_metadata = avatar.metadata) === null || _avatar_metadata === void 0 ? void 0 : _avatar_metadata.deletedAt) {
            updates.avatarUrl = null;
        } else {
            updates.avatarUrl = (0, _getdrivefileurl.default)(avatar, true);
        }
    }
    if (ps.bannerId) {
        var _banner_metadata;
        const banner = await _drivefile.default.findOne({
            _id: ps.bannerId
        });
        if (banner == null) throw new _error.ApiError(meta.errors.noSuchBanner);
        if (!banner.contentType.startsWith('image/')) throw new _error.ApiError(meta.errors.bannerNotAnImage);
        if ((_banner_metadata = banner.metadata) === null || _banner_metadata === void 0 ? void 0 : _banner_metadata.deletedAt) {
            updates.bannerUrl = null;
        } else {
            updates.bannerUrl = (0, _getdrivefileurl.default)(banner, false);
        }
    }
    if (ps.wallpaperId !== undefined) {
        if (ps.wallpaperId === null) {
            updates.wallpaperUrl = null;
            updates.wallpaperColor = null;
        } else {
            var _wallpaper_metadata;
            const wallpaper = await _drivefile.default.findOne({
                _id: ps.wallpaperId
            });
            if (wallpaper == null) throw new Error('wallpaper not found');
            if ((_wallpaper_metadata = wallpaper.metadata) === null || _wallpaper_metadata === void 0 ? void 0 : _wallpaper_metadata.deletedAt) {
                updates.wallpaperUrl = null;
            } else {
                updates.wallpaperUrl = (0, _getdrivefileurl.default)(wallpaper);
            }
        }
    }
    if (ps.fields) {
        updates.fields = ps.fields.filter((x)=>typeof x.name === 'string' && x.name !== '' && typeof x.value === 'string' && x.value !== '').map((x)=>{
            return {
                name: x.name,
                value: x.value
            };
        });
    }
    //#region emojis/tags
    if (updates.name != null || updates.description != null) {
        let emojis = [];
        let tags = [];
        if (updates.name != null) {
            const tokens = (0, _parse.parseBasic)(updates.name);
            emojis = emojis.concat((0, _extractemojis.extractEmojis)(tokens));
        }
        if (updates.description != null) {
            const tokens = (0, _parse.parseBasic)(updates.description);
            emojis = emojis.concat((0, _extractemojis.extractEmojis)(tokens));
            tags = (0, _extracthashtags.extractHashtags)(tokens).map((tag)=>(0, _normalizetag.normalizeTag)(tag)).slice(0, 64);
        }
        updates.emojis = emojis;
        updates.tags = tags;
        // ハッシュタグ更新
        (0, _updatehashtag.updateUsertags)(user, tags);
    }
    //#endregion
    await _user.default.update(user._id, {
        $set: updates
    });
    const iObj = await (0, _user.pack)(user._id, user, {
        detail: true,
        includeSecrets: isSecure
    });
    // Publish meUpdated event
    (0, _stream.publishMainStream)(user._id, 'meUpdated', iObj);
    // 鍵垢を解除したとき、溜まっていたフォローリクエストがあるならすべて承認
    if (user.isLocked && ps.isLocked === false) {
        (0, _acceptall.default)(user);
    }
    if (typeof updates.noFederation !== 'undefined') {
        if (updates.noFederation) {
            (0, _suspenduser.sendDeleteActivity)(user);
        } else {
            (0, _unsuspenduser.doPostUnsuspend)(user);
        }
    } else {
        // フォロワーにUpdateを配信
        (0, _update.publishToFollowers)(user._id);
    }
    return iObj;
});

//# sourceMappingURL=update.js.map
