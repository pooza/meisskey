"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let NetworkChart = class NetworkChart extends _.default {
    async getTemplate(init, latest) {
        return {
            incomingRequests: 0,
            outgoingRequests: 0,
            totalTime: 0,
            incomingBytes: 0,
            outgoingBytes: 0
        };
    }
    async update(incomingRequests, time, incomingBytes, outgoingBytes) {
        const inc = {
            incomingRequests: incomingRequests,
            totalTime: time,
            incomingBytes: incomingBytes,
            outgoingBytes: outgoingBytes
        };
        await this.inc(inc);
    }
    constructor(){
        super('network');
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof NetworkLog === "undefined" ? Object : NetworkLog
    ])
], NetworkChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        Number,
        Number,
        Number
    ])
], NetworkChart.prototype, "update", null);
const _default = new NetworkChart();

//# sourceMappingURL=network.js.map
