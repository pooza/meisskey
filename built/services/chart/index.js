/**
 * チャートエンジン
 */ "use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return Chart;
    },
    convertLog: function() {
        return convertLog;
    }
});
const _moment = require("moment");
const _nestedproperty = require("nested-property");
const _autobinddecorator = require("autobind-decorator");
const _mongodb = require("../../db/mongodb");
const _logger = require("../logger");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const logger = new _logger.default('chart');
const utc = _moment.utc;
let Chart = class Chart {
    convertQuery(x, path) {
        const query = {};
        const dive = (x, path)=>{
            for (const [k, v] of Object.entries(x)){
                const p = path ? `${path}.${k}` : k;
                if (typeof v === 'number') {
                    query[p] = v;
                } else {
                    dive(v, p);
                }
            }
        };
        dive(x, path);
        return query;
    }
    getCurrentDate() {
        const now = _moment().utc();
        const y = now.year();
        const m = now.month();
        const d = now.date();
        const h = now.hour();
        return [
            y,
            m,
            d,
            h
        ];
    }
    getLatestLog(span, group) {
        return this.collection.findOne({
            group: group,
            span: span
        }, {
            sort: {
                date: -1
            }
        });
    }
    async getCurrentLog(span, group) {
        const [y, m, d, h] = this.getCurrentDate();
        const current = span == 'day' ? utc([
            y,
            m,
            d
        ]) : span == 'hour' ? utc([
            y,
            m,
            d,
            h
        ]) : null;
        if (current == null) throw `Invalid span ${span}`;
        // 現在(今日または今のHour)のログ
        const currentLog = await this.collection.findOne({
            group: group,
            span: span,
            date: current.toDate()
        });
        // ログがあればそれを返して終了
        if (currentLog != null) {
            return currentLog;
        }
        let log;
        let data;
        // 集計期間が変わってから、初めてのチャート更新なら
        // 最も最近のログを持ってくる
        // * 例えば集計期間が「日」である場合で考えると、
        // * 昨日何もチャートを更新するような出来事がなかった場合は、
        // * ログがそもそも作られずドキュメントが存在しないということがあり得るため、
        // * 「昨日の」と決め打ちせずに「もっとも最近の」とします
        const latest = await this.getLatestLog(span, group);
        if (latest != null) {
            // 空ログデータを作成
            data = await this.getTemplate(false, latest.data);
        } else {
            // ログが存在しなかったら
            // (Misskeyインスタンスを建てて初めてのチャート更新時など
            // または何らかの理由でチャートコレクションを抹消した場合)
            // 初期ログデータを作成
            data = await this.getTemplate(true, null, group);
            logger.info(`${this.name}: Initial commit created`);
        }
        try {
            // 新規ログ挿入
            log = await this.collection.insert({
                group: group,
                span: span,
                date: current.toDate(),
                data: data
            });
        } catch (e) {
            // 11000 is duplicate key error
            // 並列動作している他のチャートエンジンプロセスと処理が重なる場合がある
            // その場合は再度最も新しいログを持ってくる
            if (e.code === 11000) {
                log = await this.getLatestLog(span, group);
            } else {
                logger.error(e);
                throw e;
            }
        }
        const dateExpire = new Date(Date.now() - (span === 'hour' ? 1000 * 60 * 60 * this.samples : 1000 * 60 * 60 * 24 * this.samples));
        const deleted = await this.collection.remove({
            span: span,
            date: {
                $lt: dateExpire
            }
        });
        if (deleted.deletedCount > 0) logger.info(`${this.name}: Deleted ${span} ${deleted.deletedCount} logs before ${dateExpire.toLocaleString()}`);
        return log;
    }
    commit(query, group, uniqueKey, uniqueValue) {
        const update = (log)=>{
            // ユニークインクリメントの場合、指定のキーに指定の値が既に存在していたら弾く
            if (uniqueKey && log.unique && log.unique[uniqueKey] && log.unique[uniqueKey].includes(uniqueValue)) return;
            // ユニークインクリメントの指定のキーに値を追加
            if (uniqueKey) {
                query['$push'] = {
                    [`unique.${uniqueKey}`]: uniqueValue
                };
            }
            // ログ更新
            this.collection.update({
                _id: log._id
            }, query);
        };
        this.getCurrentLog('day', group).then((log)=>update(log));
        this.getCurrentLog('hour', group).then((log)=>update(log));
    }
    inc(inc, group) {
        this.commit({
            $inc: this.convertQuery(inc, 'data')
        }, group);
    }
    incIfUnique(inc, key, value, group) {
        this.commit({
            $inc: this.convertQuery(inc, 'data')
        }, group, key, value);
    }
    async getChart(span, range, group) {
        const promisedChart = [];
        const [y, m, d, h] = this.getCurrentDate();
        const gt = span == 'day' ? utc([
            y,
            m,
            d
        ]).subtract(range, 'days') : span == 'hour' ? utc([
            y,
            m,
            d,
            h
        ]).subtract(range, 'hours') : null;
        if (gt == null) throw `Invalid span ${span}`;
        // ログ取得
        let logs = await this.collection.find({
            group: group,
            span: span,
            date: {
                $gte: gt.toDate()
            }
        }, {
            sort: {
                date: -1
            },
            fields: {
                _id: 0
            }
        });
        // 要求された範囲にログがひとつもなかったら
        if (logs.length == 0) {
            // もっとも新しいログを持ってくる
            // (すくなくともひとつログが無いと隙間埋めできないため)
            const recentLog = await this.collection.findOne({
                group: group,
                span: span
            }, {
                sort: {
                    date: -1
                },
                fields: {
                    _id: 0
                }
            });
            if (recentLog) {
                logs = [
                    recentLog
                ];
            }
        // 要求された範囲の最も古い箇所に位置するログが存在しなかったら
        } else if (!utc(logs[logs.length - 1].date).isSame(gt)) {
            // 要求された範囲の最も古い箇所時点での最も新しいログを持ってきて末尾に追加する
            // (隙間埋めできないため)
            const outdatedLog = await this.collection.findOne({
                group: group,
                span: span,
                date: {
                    $lt: gt.toDate()
                }
            }, {
                sort: {
                    date: -1
                },
                fields: {
                    _id: 0
                }
            });
            if (outdatedLog) {
                logs.push(outdatedLog);
            }
        }
        // 整形
        for(let i = range - 1; i >= 0; i--){
            const current = span == 'day' ? utc([
                y,
                m,
                d
            ]).subtract(i, 'days') : span == 'hour' ? utc([
                y,
                m,
                d,
                h
            ]).subtract(i, 'hours') : null;
            const log = logs.find((l)=>utc(l.date).isSame(current));
            if (log) {
                promisedChart.unshift(Promise.resolve(log.data));
            } else {
                // 隙間埋め
                const latest = logs.find((l)=>utc(l.date).isBefore(current));
                promisedChart.unshift(this.getTemplate(false, latest ? latest.data : null));
            }
        }
        const chart = await Promise.all(promisedChart);
        const res = {};
        /**
		 * [{ foo: 1, bar: 5 }, { foo: 2, bar: 6 }, { foo: 3, bar: 7 }]
		 * を
		 * { foo: [1, 2, 3], bar: [5, 6, 7] }
		 * にする
		 */ const dive = (x, path)=>{
            for (const [k, v] of Object.entries(x)){
                const p = path ? `${path}.${k}` : k;
                if (typeof v == 'object') {
                    dive(v, p);
                } else {
                    _nestedproperty.set(res, p, chart.map((s)=>_nestedproperty.get(s, p)));
                }
            }
        };
        dive(chart[0]);
        return res;
    }
    constructor(name, grouped = false, samples = 500){
        _define_property(this, "collection", void 0);
        _define_property(this, "name", void 0);
        _define_property(this, "samples", void 0);
        this.name = name;
        this.samples = samples;
        this.collection = _mongodb.default.get(`chart.${name}`);
        const keys = {
            span: -1,
            date: -1
        };
        if (grouped) keys.group = -1;
        this.collection.createIndex(keys, {
            unique: true
        });
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Obj === "undefined" ? Object : Obj,
        String
    ])
], Chart.prototype, "convertQuery", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], Chart.prototype, "getCurrentDate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Span === "undefined" ? Object : Span,
        Object
    ])
], Chart.prototype, "getLatestLog", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Span === "undefined" ? Object : Span,
        Object
    ])
], Chart.prototype, "getCurrentLog", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Obj === "undefined" ? Object : Obj,
        Object,
        String,
        String
    ])
], Chart.prototype, "commit", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Partial === "undefined" ? Object : Partial,
        Object
    ])
], Chart.prototype, "inc", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Partial === "undefined" ? Object : Partial,
        String,
        String,
        Object
    ])
], Chart.prototype, "incIfUnique", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Span === "undefined" ? Object : Span,
        Number,
        Object
    ])
], Chart.prototype, "getChart", null);
function convertLog(logSchema) {
    const v = JSON.parse(JSON.stringify(logSchema)); // copy
    if (v.type === 'number') {
        v.type = 'array';
        v.items = {
            type: 'number'
        };
    } else if (v.type === 'object') {
        for (const k of Object.keys(v.properties)){
            v.properties[k] = convertLog(v.properties[k]);
        }
    }
    return v;
}

//# sourceMappingURL=index.js.map
