"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    usersLogSchema: function() {
        return usersLogSchema;
    },
    default: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
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
	 * 集計期間時点での、全ユーザー数
	 */ total: {
        type: 'number',
        description: '集計期間時点での、全ユーザー数'
    },
    /**
	 * 増加したユーザー数
	 */ inc: {
        type: 'number',
        description: '増加したユーザー数'
    },
    /**
	 * 減少したユーザー数
	 */ dec: {
        type: 'number',
        description: '減少したユーザー数'
    }
};
const usersLogSchema = {
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
let UsersChart = class UsersChart extends _.default {
    async getTemplate(init, latest) {
        const [localCount, remoteCount] = init ? await Promise.all([
            _user.default.count({
                host: null
            }),
            _user.default.count({
                host: {
                    $ne: null
                }
            })
        ]) : [
            latest ? latest.local.total : 0,
            latest ? latest.remote.total : 0
        ];
        return {
            local: {
                total: localCount,
                inc: 0,
                dec: 0
            },
            remote: {
                total: remoteCount,
                inc: 0,
                dec: 0
            }
        };
    }
    async update(user, isAdditional) {
        const update = {};
        update.total = isAdditional ? 1 : -1;
        if (isAdditional) {
            update.inc = 1;
        } else {
            update.dec = 1;
        }
        await this.inc({
            [(0, _user.isLocalUser)(user) ? 'local' : 'remote']: update
        });
    }
    constructor(){
        super('users');
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof UsersLog === "undefined" ? Object : UsersLog
    ])
], UsersChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _user.IUser === "undefined" ? Object : _user.IUser,
        Boolean
    ])
], UsersChart.prototype, "update", null);
const _default = new UsersChart();

//# sourceMappingURL=users.js.map
