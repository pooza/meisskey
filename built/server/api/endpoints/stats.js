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
const _define = require("../define");
const _drive = require("../../../services/chart/drive");
const _federation = require("../../../services/chart/federation");
const _fetchmeta = require("../../../misc/fetch-meta");
const meta = {
    requireCredential: false,
    allowGet: true,
    cacheSec: 600,
    canDenyPost: true,
    desc: {
        'en-US': 'Get the instance\'s statistics'
    },
    tags: [
        'meta'
    ],
    params: {},
    res: {
        type: 'object',
        properties: {
            notesCount: {
                type: 'number',
                description: 'The count of all (local/remote) notes of this instance.'
            },
            originalNotesCount: {
                type: 'number',
                description: 'The count of all local notes of this instance.'
            },
            usersCount: {
                type: 'number',
                description: 'The count of all (local/remote) accounts of this instance.'
            },
            originalUsersCount: {
                type: 'number',
                description: 'The count of all local accounts of this instance.'
            },
            instances: {
                type: 'number',
                description: 'The count of federated instances.'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async ()=>{
    const instance = await (0, _fetchmeta.default)();
    const stats = Object.assign({
        notesCount: 0,
        originalNotesCount: 0,
        usersCount: 0,
        originalUsersCount: 0,
        reactionsCount: 0
    }, instance.stats || {});
    const driveStats = await _drive.default.getChart('hour', 1);
    stats.driveUsageLocal = driveStats.local.totalSize[0];
    stats.driveUsageRemote = driveStats.remote.totalSize[0];
    const federationStats = await _federation.default.getChart('hour', 1);
    stats.instances = federationStats.instance.total[0];
    return stats;
});

//# sourceMappingURL=stats.js.map
