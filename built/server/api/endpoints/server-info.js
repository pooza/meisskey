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
const _os = require("os");
const _systeminformation = require("systeminformation");
const _define = require("../define");
const _config = require("../../../config");
const meta = {
    requireCredential: false,
    allowGet: true,
    desc: {},
    tags: [
        'meta'
    ],
    params: {}
};
const _default = (0, _define.default)(meta, async ()=>{
    const memStats = await _systeminformation.mem();
    const fsStats = await _systeminformation.fsSize();
    return {
        machine: _config.default.hideServerInfo ? 'Unknown' : _os.hostname(),
        os: _config.default.hideServerInfo ? 'Unknown' : _os.platform(),
        node: _config.default.hideServerInfo ? 'Unknown' : process.version,
        cpu: {
            model: _config.default.hideServerInfo ? 'Unknown' : _os.cpus()[0].model,
            cores: _config.default.hideServerInfo ? 'Unknown' : _os.cpus().length
        },
        mem: {
            total: _config.default.hideServerInfo ? 'Unknown' : memStats.total
        },
        fs: {
            total: _config.default.hideServerInfo ? 'Unknown' : fsStats[0].size,
            used: _config.default.hideServerInfo ? 'Unknown' : fsStats[0].used
        }
    };
});

//# sourceMappingURL=server-info.js.map
