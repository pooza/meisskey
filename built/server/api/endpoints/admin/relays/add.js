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
const _cafy = require("cafy");
const _define = require("../../../define");
const _relay = require("../../../../../services/relay");
const _error = require("../../../error");
const meta = {
    desc: {
        'ja-JP': 'Add relay'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        inbox: {
            validator: _cafy.default.str
        }
    },
    errors: {
        invalidUrl: {
            message: 'Invalid URL',
            code: 'INVALID_URL',
            id: 'fb8c92d3-d4e5-44e7-b3d4-800d5cef8b2c'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    try {
        if (new URL(ps.inbox).protocol !== 'https:') throw 'https only';
    } catch (e) {
        throw new _error.ApiError(meta.errors.invalidUrl);
    }
    return await (0, _relay.addRelay)(ps.inbox);
});

//# sourceMappingURL=add.js.map
