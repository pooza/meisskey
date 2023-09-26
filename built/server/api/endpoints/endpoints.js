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
const _endpoints = require("../endpoints");
const meta = {
    desc: {
        'ja-JP': '使用できるAPI一覧を返します。',
        'en-US': 'Returns a list of available APIs.'
    },
    requireCredential: false,
    allowGet: true,
    tags: [
        'meta'
    ],
    params: {},
    res: {
        type: 'array',
        optional: false,
        nullable: false,
        items: {
            type: 'string',
            optional: false,
            nullable: false
        },
        example: [
            'admin/abuse-user-reports',
            'admin/accounts/create',
            'admin/announcements/create',
            '...'
        ]
    }
};
const _default = (0, _define.default)(meta, async ()=>{
    return _endpoints.default.map((x)=>x.name);
});

//# sourceMappingURL=endpoints.js.map
