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
const _config = require("../../../config");
const _define = require("../define");
const meta = {
    desc: {
        'ja-JP': 'インスタンスバージョンを取得します。',
        'en-US': 'Get the version of this instance.'
    },
    tags: [
        'meta'
    ],
    requireCredential: false,
    res: {
        type: 'object',
        properties: {
            version: {
                type: 'string',
                description: 'The version of Misskey of this instance.',
                example: _config.default.version
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const response = {
        version: _config.default.version
    };
    return response;
});

//# sourceMappingURL=version.js.map
