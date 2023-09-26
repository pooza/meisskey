"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require(".");
const _user = require("../../models/user");
const _note = require("../../models/note");
const _following = require("../../models/following");
const _drivefile = require("../../models/drive-file");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let InstanceChart = class InstanceChart extends _.default {
    async getTemplate(init, latest, group) {
        const calcUsage = ()=>_drivefile.default.aggregate([
                {
                    $match: {
                        'metadata._user.host': group,
                        'metadata.deletedAt': {
                            $exists: false
                        }
                    }
                },
                {
                    $project: {
                        length: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        usage: {
                            $sum: '$length'
                        }
                    }
                }
            ]).then((res)=>res.length > 0 ? res[0].usage : 0);
        const [notesCount, usersCount, followingCount, followersCount, driveFiles, driveUsage] = init ? await Promise.all([
            _note.default.count({
                '_user.host': group
            }),
            _user.default.count({
                host: group
            }),
            _following.default.count({
                '_follower.host': group
            }),
            _following.default.count({
                '_followee.host': group
            }),
            _drivefile.default.count({
                'metadata._user.host': group
            }),
            calcUsage()
        ]) : [
            latest ? latest.notes.total : 0,
            latest ? latest.users.total : 0,
            latest ? latest.following.total : 0,
            latest ? latest.followers.total : 0,
            latest ? latest.drive.totalFiles : 0,
            latest ? latest.drive.totalUsage : 0
        ];
        return {
            requests: {
                failed: 0,
                succeeded: 0,
                received: 0
            },
            notes: {
                total: notesCount,
                inc: 0,
                dec: 0
            },
            users: {
                total: usersCount,
                inc: 0,
                dec: 0
            },
            following: {
                total: followingCount,
                inc: 0,
                dec: 0
            },
            followers: {
                total: followersCount,
                inc: 0,
                dec: 0
            },
            drive: {
                totalFiles: driveFiles,
                totalUsage: driveUsage,
                incFiles: 0,
                incUsage: 0,
                decFiles: 0,
                decUsage: 0
            }
        };
    }
    async requestReceived(host) {
        await this.inc({
            requests: {
                received: 1
            }
        }, host);
    }
    async requestSent(host, isSucceeded) {
        const update = {};
        if (isSucceeded) {
            update.succeeded = 1;
        } else {
            update.failed = 1;
        }
        await this.inc({
            requests: update
        }, host);
    }
    async newUser(host) {
        await this.inc({
            users: {
                total: 1,
                inc: 1
            }
        }, host);
    }
    async updateNote(host, isAdditional) {
        await this.inc({
            notes: {
                total: isAdditional ? 1 : -1,
                inc: isAdditional ? 1 : 0,
                dec: isAdditional ? 0 : 1
            }
        }, host);
    }
    async updateFollowing(host, isAdditional) {
        await this.inc({
            following: {
                total: isAdditional ? 1 : -1,
                inc: isAdditional ? 1 : 0,
                dec: isAdditional ? 0 : 1
            }
        }, host);
    }
    async updateFollowers(host, isAdditional) {
        await this.inc({
            followers: {
                total: isAdditional ? 1 : -1,
                inc: isAdditional ? 1 : 0,
                dec: isAdditional ? 0 : 1
            }
        }, host);
    }
    async updateDrive(file, isAdditional) {
        const update = {};
        update.totalFiles = isAdditional ? 1 : -1;
        update.totalUsage = isAdditional ? file.length : -file.length;
        if (isAdditional) {
            update.incFiles = 1;
            update.incUsage = file.length;
        } else {
            update.decFiles = 1;
            update.decUsage = file.length;
        }
        await this.inc({
            drive: update
        }, file.metadata._user.host);
    }
    constructor(){
        super('instance', true);
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof InstanceLog === "undefined" ? Object : InstanceLog,
        Object
    ])
], InstanceChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], InstanceChart.prototype, "requestReceived", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Boolean
    ])
], InstanceChart.prototype, "requestSent", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], InstanceChart.prototype, "newUser", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Boolean
    ])
], InstanceChart.prototype, "updateNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Boolean
    ])
], InstanceChart.prototype, "updateFollowing", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Boolean
    ])
], InstanceChart.prototype, "updateFollowers", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drivefile.IDriveFile === "undefined" ? Object : _drivefile.IDriveFile,
        Boolean
    ])
], InstanceChart.prototype, "updateDrive", null);
const _default = new InstanceChart();

//# sourceMappingURL=instance.js.map
