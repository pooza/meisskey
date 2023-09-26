"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    perUserDriveLogSchema: function() {
        return perUserDriveLogSchema;
    },
    default: function() {
        return _default;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ = require("./");
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
const perUserDriveLogSchema = {
    type: 'object',
    properties: {
        /**
		 * 集計期間時点での、全ドライブファイル数
		 */ totalCount: {
            type: 'number',
            description: '集計期間時点での、全ドライブファイル数'
        },
        /**
		 * 集計期間時点での、全ドライブファイルの合計サイズ
		 */ totalSize: {
            type: 'number',
            description: '集計期間時点での、全ドライブファイルの合計サイズ'
        },
        /**
		 * 増加したドライブファイル数
		 */ incCount: {
            type: 'number',
            description: '増加したドライブファイル数'
        },
        /**
		 * 増加したドライブ使用量
		 */ incSize: {
            type: 'number',
            description: '増加したドライブ使用量'
        },
        /**
		 * 減少したドライブファイル数
		 */ decCount: {
            type: 'number',
            description: '減少したドライブファイル数'
        },
        /**
		 * 減少したドライブ使用量
		 */ decSize: {
            type: 'number',
            description: '減少したドライブ使用量'
        }
    }
};
let PerUserDriveChart = class PerUserDriveChart extends _.default {
    async getTemplate(init, latest, group) {
        const calcSize = ()=>_drivefile.default.aggregate([
                {
                    $match: {
                        'metadata.userId': group,
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
        const [count, size] = init ? await Promise.all([
            _drivefile.default.count({
                'metadata.userId': group
            }),
            calcSize()
        ]) : [
            latest ? latest.totalCount : 0,
            latest ? latest.totalSize : 0
        ];
        return {
            totalCount: count,
            totalSize: size,
            incCount: 0,
            incSize: 0,
            decCount: 0,
            decSize: 0
        };
    }
    async update(file, isAdditional) {
        const update = {};
        update.totalCount = isAdditional ? 1 : -1;
        update.totalSize = isAdditional ? file.length : -file.length;
        if (isAdditional) {
            update.incCount = 1;
            update.incSize = file.length;
        } else {
            update.decCount = 1;
            update.decSize = file.length;
        }
        await this.inc(update, file.metadata.userId);
    }
    constructor(){
        super('perUserDrive', true, 50);
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Boolean,
        typeof PerUserDriveLog === "undefined" ? Object : PerUserDriveLog,
        Object
    ])
], PerUserDriveChart.prototype, "getTemplate", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _drivefile.IDriveFile === "undefined" ? Object : _drivefile.IDriveFile,
        Boolean
    ])
], PerUserDriveChart.prototype, "update", null);
const _default = new PerUserDriveChart();

//# sourceMappingURL=per-user-drive.js.map
