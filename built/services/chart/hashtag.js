"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
const _user = require("../../models/user");
const _mongodb = require("../../db/mongodb");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let HashtagChart = class HashtagChart extends _.default {
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
    async update(hashtag, user) {
        const update = {
            count: 1
        };
        await this.incIfUnique({
            [(0, _user.isLocalUser)(user) ? 'local' : 'remote']: update
        }, 'users', user._id.toHexString(), hashtag);
    }
    constructor(){
        super('hashtag', true);
        // 後方互換性のため
        _mongodb.default.get('chart.hashtag').findOne().then((doc)=>{
            if (doc != null && doc.data.local == null) {
                _mongodb.default.get('chart.hashtag').drop();
            }
        });
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof HashtagLog === "undefined" ? Object : HashtagLog
    ])
], HashtagChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _user.IUser === "undefined" ? Object : _user.IUser
    ])
], HashtagChart.prototype, "update", null);
const _default = new HashtagChart();

//# sourceMappingURL=hashtag.js.map
