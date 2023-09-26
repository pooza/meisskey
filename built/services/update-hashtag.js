"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    updateHashtags: function() {
        return updateHashtags;
    },
    updateUsertags: function() {
        return updateUsertags;
    },
    updateHashtag: function() {
        return updateHashtag;
    }
});
const _user = require("../models/user");
const _hashtag = require("../models/hashtag");
const _hashtag1 = require("./chart/hashtag");
const _normalizetag = require("../misc/normalize-tag");
async function updateHashtags(user, tags) {
    for (const tag of tags){
        await updateHashtag(user, tag);
    }
}
async function updateUsertags(user, tags) {
    for (const tag of tags){
        await updateHashtag(user, tag, true, true);
    }
    for (const tag of (user.tags || []).filter((x)=>!tags.includes(x))){
        await updateHashtag(user, tag, true, false);
    }
}
async function updateHashtag(user, tag, isUserAttached = false, inc = true) {
    tag = (0, _normalizetag.normalizeTag)(tag);
    const index = await _hashtag.default.findOne({
        tag
    });
    if (index == null && !inc) return;
    if (index != null) {
        const $push = {};
        const $pull = {};
        const $inc = {};
        if (isUserAttached) {
            if (inc) {
                // 自分が初めてこのタグを使ったなら
                if (!index.attachedUserIds.some((id)=>id.equals(user._id))) {
                    $push.attachedUserIds = user._id;
                    $inc.attachedUsersCount = 1;
                }
                // 自分が(ローカル内で)初めてこのタグを使ったなら
                if ((0, _user.isLocalUser)(user) && !index.attachedLocalUserIds.some((id)=>id.equals(user._id))) {
                    $push.attachedLocalUserIds = user._id;
                    $inc.attachedLocalUsersCount = 1;
                }
                // 自分が(リモートで)初めてこのタグを使ったなら
                if ((0, _user.isRemoteUser)(user) && !index.attachedRemoteUserIds.some((id)=>id.equals(user._id))) {
                    $push.attachedRemoteUserIds = user._id;
                    $inc.attachedRemoteUsersCount = 1;
                }
            } else {
                $pull.attachedUserIds = user._id;
                $inc.attachedUsersCount = -1;
                if ((0, _user.isLocalUser)(user)) {
                    $pull.attachedLocalUserIds = user._id;
                    $inc.attachedLocalUsersCount = -1;
                } else {
                    $pull.attachedRemoteUserIds = user._id;
                    $inc.attachedRemoteUsersCount = -1;
                }
            }
        } else {
            // 自分が初めてこのタグを使ったなら
            if (!index.mentionedUserIds.some((id)=>id.equals(user._id))) {
                $push.mentionedUserIds = user._id;
                $inc.mentionedUsersCount = 1;
            }
            // 自分が(ローカル内で)初めてこのタグを使ったなら
            if ((0, _user.isLocalUser)(user) && !index.mentionedLocalUserIds.some((id)=>id.equals(user._id))) {
                $push.mentionedLocalUserIds = user._id;
                $inc.mentionedLocalUsersCount = 1;
            }
            // 自分が(リモートで)初めてこのタグを使ったなら
            if ((0, _user.isRemoteUser)(user) && !index.mentionedRemoteUserIds.some((id)=>id.equals(user._id))) {
                $push.mentionedRemoteUserIds = user._id;
                $inc.mentionedRemoteUsersCount = 1;
            }
        }
        const q = {};
        if (Object.keys($push).length > 0) q.$push = $push;
        if (Object.keys($pull).length > 0) q.$pull = $pull;
        if (Object.keys($inc).length > 0) q.$inc = $inc;
        if (Object.keys(q).length > 0) _hashtag.default.update({
            tag
        }, q);
    } else {
        if (isUserAttached) {
            _hashtag.default.insert({
                tag,
                mentionedUserIds: [],
                mentionedUsersCount: 0,
                mentionedLocalUserIds: [],
                mentionedLocalUsersCount: 0,
                mentionedRemoteUserIds: [],
                mentionedRemoteUsersCount: 0,
                attachedUserIds: [
                    user._id
                ],
                attachedUsersCount: 1,
                attachedLocalUserIds: (0, _user.isLocalUser)(user) ? [
                    user._id
                ] : [],
                attachedLocalUsersCount: (0, _user.isLocalUser)(user) ? 1 : 0,
                attachedRemoteUserIds: (0, _user.isRemoteUser)(user) ? [
                    user._id
                ] : [],
                attachedRemoteUsersCount: (0, _user.isRemoteUser)(user) ? 1 : 0
            });
        } else {
            _hashtag.default.insert({
                tag,
                mentionedUserIds: [
                    user._id
                ],
                mentionedUsersCount: 1,
                mentionedLocalUserIds: (0, _user.isLocalUser)(user) ? [
                    user._id
                ] : [],
                mentionedLocalUsersCount: (0, _user.isLocalUser)(user) ? 1 : 0,
                mentionedRemoteUserIds: (0, _user.isRemoteUser)(user) ? [
                    user._id
                ] : [],
                mentionedRemoteUsersCount: (0, _user.isRemoteUser)(user) ? 1 : 0,
                attachedUserIds: [],
                attachedUsersCount: 0,
                attachedLocalUserIds: [],
                attachedLocalUsersCount: 0,
                attachedRemoteUserIds: [],
                attachedRemoteUsersCount: 0
            });
        }
    }
    if (!isUserAttached) {
        _hashtag1.default.update(tag, user);
    }
}

//# sourceMappingURL=update-hashtag.js.map
