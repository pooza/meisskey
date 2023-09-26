"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    notesLogSchema: function() {
        return notesLogSchema;
    },
    default: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require(".");
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
const logSchema = {
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
};
const notesLogSchema = {
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
let NotesChart = class NotesChart extends _.default {
    async getTemplate(init, latest) {
        const [localCount, remoteCount] = init ? await Promise.all([
            _note.default.count({
                '_user.host': null
            }),
            _note.default.count({
                '_user.host': {
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
                dec: 0,
                diffs: {
                    normal: 0,
                    reply: 0,
                    renote: 0
                }
            },
            remote: {
                total: remoteCount,
                inc: 0,
                dec: 0,
                diffs: {
                    normal: 0,
                    reply: 0,
                    renote: 0
                }
            }
        };
    }
    async update(note, isAdditional) {
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
        await this.inc({
            [(0, _user.isLocalUser)(note._user) ? 'local' : 'remote']: update
        });
    }
    constructor(){
        super('notes');
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof NotesLog === "undefined" ? Object : NotesLog
    ])
], NotesChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _note.INote === "undefined" ? Object : _note.INote,
        Boolean
    ])
], NotesChart.prototype, "update", null);
const _default = new NotesChart();

//# sourceMappingURL=notes.js.map
