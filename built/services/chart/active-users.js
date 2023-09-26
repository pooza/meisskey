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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ActiveUsersChart = class ActiveUsersChart extends _.default {
    async getTemplate(init, latest) {
        return {
            local: {
                count: 0
            },
            remote: {
                count: 0
            }
        };
    }
    async update(user) {
        const update = {
            count: 1
        };
        await this.incIfUnique({
            [(0, _user.isLocalUser)(user) ? 'local' : 'remote']: update
        }, 'users', user._id.toHexString());
        _user.default.update({
            _id: user._id
        }, {
            $set: {
                lastActivityAt: new Date()
            }
        });
    }
    constructor(){
        super('activeUsers');
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof ActiveUsersLog === "undefined" ? Object : ActiveUsersLog
    ])
], ActiveUsersChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _user.IUser === "undefined" ? Object : _user.IUser
    ])
], ActiveUsersChart.prototype, "update", null);
const _default = new ActiveUsersChart();

//# sourceMappingURL=active-users.js.map
