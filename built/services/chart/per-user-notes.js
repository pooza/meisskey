"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    perUserNotesLogSchema: function() {
        return perUserNotesLogSchema;
    },
    default: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
const _note = require("../../models/note");
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
const perUserNotesLogSchema = {
    type: 'object',
    properties: {
        total: {
            type: 'number',
            description: '集計期間時点での、全投稿数'
        },
        inc: {
            type: 'number',
            description: '増加した投稿数'
        },
        dec: {
            type: 'number',
            description: '減少した投稿数'
        },
        diffs: {
            type: 'object',
            properties: {
                normal: {
                    type: 'number',
                    description: '通常の投稿数の差分'
                },
                reply: {
                    type: 'number',
                    description: 'リプライの投稿数の差分'
                },
                renote: {
                    type: 'number',
                    description: 'Renoteの投稿数の差分'
                }
            }
        }
    }
};
let PerUserNotesChart = class PerUserNotesChart extends _.default {
    async getTemplate(init, latest, group) {
        const [count] = init ? await Promise.all([
            _note.default.count({
                userId: group,
                deletedAt: null
            })
        ]) : [
            latest ? latest.total : 0
        ];
        return {
            total: count,
            inc: 0,
            dec: 0,
            diffs: {
                normal: 0,
                reply: 0,
                renote: 0
            }
        };
    }
    async update(user, note, isAdditional) {
        const update = {
            diffs: {}
        };
        update.total = isAdditional ? 1 : -1;
        if (isAdditional) {
            update.inc = 1;
        } else {
            update.dec = 1;
        }
        if (note.replyId != null) {
            update.diffs.reply = isAdditional ? 1 : -1;
        } else if (note.renoteId != null) {
            update.diffs.renote = isAdditional ? 1 : -1;
        } else {
            update.diffs.normal = isAdditional ? 1 : -1;
        }
        await this.inc(update, user._id);
    }
    constructor(){
        super('perUserNotes', true, 150);
    // リモートユーザーは50くらい、ローカルユーザーは150くらいアクティビティウィジットで参照される
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof PerUserNotesLog === "undefined" ? Object : PerUserNotesLog,
        Object
    ])
], PerUserNotesChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _user.IUser === "undefined" ? Object : _user.IUser,
        typeof _note.INote === "undefined" ? Object : _note.INote,
        Boolean
    ])
], PerUserNotesChart.prototype, "update", null);
const _default = new PerUserNotesChart();

//# sourceMappingURL=per-user-notes.js.map
