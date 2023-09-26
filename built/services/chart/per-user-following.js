"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    logSchema: function() {
        return logSchema;
    },
    perUserFollowingLogSchema: function() {
        return perUserFollowingLogSchema;
    },
    default: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
const _following = require("../../models/following");
const _user = require("../../models/user");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const logSchema = {
    /**
	 * フォローしている
	 */ followings: {
        type: 'object',
        properties: {
            /**
			 * フォローしている合計
			 */ total: {
                type: 'number',
                description: 'フォローしている合計'
            },
            /**
			 * フォローした数
			 */ inc: {
                type: 'number',
                description: 'フォローした数'
            },
            /**
			 * フォロー解除した数
			 */ dec: {
                type: 'number',
                description: 'フォロー解除した数'
            }
        }
    },
    /**
	 * フォローされている
	 */ followers: {
        type: 'object',
        properties: {
            /**
			 * フォローされている合計
			 */ total: {
                type: 'number',
                description: 'フォローされている合計'
            },
            /**
			 * フォローされた数
			 */ inc: {
                type: 'number',
                description: 'フォローされた数'
            },
            /**
			 * フォロー解除された数
			 */ dec: {
                type: 'number',
                description: 'フォロー解除された数'
            }
        }
    }
};
const perUserFollowingLogSchema = {
    type: 'object',
    properties: {
        local: {
            type: 'object',
            properties: logSchema
        },
        remote: {
            type: 'object',
            properties: logSchema
        }
    }
};
let PerUserFollowingChart = class PerUserFollowingChart extends _.default {
    async getTemplate(init, latest, group) {
        const [localFollowingsCount, localFollowersCount, remoteFollowingsCount, remoteFollowersCount] = init ? await Promise.all([
            _following.default.count({
                followerId: group,
                '_followee.host': null
            }),
            _following.default.count({
                followeeId: group,
                '_follower.host': null
            }),
            _following.default.count({
                followerId: group,
                '_followee.host': {
                    $ne: null
                }
            }),
            _following.default.count({
                followeeId: group,
                '_follower.host': {
                    $ne: null
                }
            })
        ]) : [
            latest ? latest.local.followings.total : 0,
            latest ? latest.local.followers.total : 0,
            latest ? latest.remote.followings.total : 0,
            latest ? latest.remote.followers.total : 0
        ];
        return {
            local: {
                followings: {
                    total: localFollowingsCount,
                    inc: 0,
                    dec: 0
                },
                followers: {
                    total: localFollowersCount,
                    inc: 0,
                    dec: 0
                }
            },
            remote: {
                followings: {
                    total: remoteFollowingsCount,
                    inc: 0,
                    dec: 0
                },
                followers: {
                    total: remoteFollowersCount,
                    inc: 0,
                    dec: 0
                }
            }
        };
    }
    async update(follower, followee, isFollow) {
        const update = {};
        update.total = isFollow ? 1 : -1;
        if (isFollow) {
            update.inc = 1;
        } else {
            update.dec = 1;
        }
        this.inc({
            [(0, _user.isLocalUser)(follower) ? 'local' : 'remote']: {
                followings: update
            }
        }, follower._id);
        this.inc({
            [(0, _user.isLocalUser)(followee) ? 'local' : 'remote']: {
                followers: update
            }
        }, followee._id);
    }
    constructor(){
        super('perUserFollowing', true, 50);
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof PerUserFollowingLog === "undefined" ? Object : PerUserFollowingLog,
        Object
    ])
], PerUserFollowingChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _user.IUser === "undefined" ? Object : _user.IUser,
        typeof _user.IUser === "undefined" ? Object : _user.IUser,
        Boolean
    ])
], PerUserFollowingChart.prototype, "update", null);
const _default = new PerUserFollowingChart();

//# sourceMappingURL=per-user-following.js.map
