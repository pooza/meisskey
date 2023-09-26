"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _drivefile = require("../../../models/drive-file");
const _define = require("../define");
const _fetchmeta = require("../../../misc/fetch-meta");
const meta = {
    desc: {
        'ja-JP': 'ドライブの情報を取得します。',
        'en-US': 'Get drive information.'
    },
    tags: [
        'drive',
        'account'
    ],
    requireCredential: true,
    kind: [
        'read:drive',
        'drive-read'
    ],
    res: {
        type: 'object',
        properties: {
            capacity: {
                type: 'number'
            },
            usage: {
                type: 'number'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const instance = await (0, _fetchmeta.default)();
    // Calculate drive usage
    const usage = await _drivefile.default.aggregate([
        {
            $match: {
                'metadata.userId': user._id,
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
    ]).then((aggregates)=>{
        if (aggregates.length > 0) {
            return aggregates[0].usage;
        }
        return 0;
    });
    return {
        capacity: 1024 * 1024 * instance.localDriveCapacityMb,
        usage: usage
    };
});

//# sourceMappingURL=drive.js.map
