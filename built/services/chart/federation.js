"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require(".");
const _instance = require("../../models/instance");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let FederationChart = class FederationChart extends _.default {
    async getTemplate(init, latest) {
        const [total] = init ? await Promise.all([
            _instance.default.count({})
        ]) : [
            latest ? latest.instance.total : 0
        ];
        return {
            instance: {
                total: total,
                inc: 0,
                dec: 0
            }
        };
    }
    async update(isAdditional) {
        const update = {};
        update.total = isAdditional ? 1 : -1;
        if (isAdditional) {
            update.inc = 1;
        } else {
            update.dec = 1;
        }
        await this.inc({
            instance: update
        });
    }
    constructor(){
        super('federation');
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof FederationLog === "undefined" ? Object : FederationLog
    ])
], FederationChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean
    ])
], FederationChart.prototype, "update", null);
const _default = new FederationChart();

//# sourceMappingURL=federation.js.map
