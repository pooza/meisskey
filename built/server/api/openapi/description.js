"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    kinds: function() {
        return kinds;
    },
    getDescription: function() {
        return getDescription;
    }
});
const _endpoints = require("../endpoints");
const _ = require("../../../../locales/");
const _array = require("../../../prelude/array");
const _kinds = require("../kinds");
function kinds() {
    const kinds = (0, _array.fromEntries)(_kinds.kinds.map((k)=>[
            k,
            {
                endpoints: [],
                descs: (0, _array.fromEntries)(Object.keys(_).map((l)=>[
                        l,
                        _[l].common.permissions[k]
                    ]))
            }
        ]));
    const errors = [];
    for (const endpoint of _endpoints.default.filter((ep)=>!ep.meta.secure && !ep.name.startsWith('admin/'))){
        if (endpoint.meta.secure) {
        //kinds['_secure_'].endpoints.push(endpoint.name);
        } else if (endpoint.meta.requireAdmin) {
        //kinds['_admin_'].endpoints.push(endpoint.name);
        } else if (endpoint.meta.requireModerator) {
        //kinds['_moderator_'].endpoints.push(endpoint.name);
        } else if (endpoint.meta.kind) {
            const kind = (0, _array.toArray)(endpoint.meta.kind)[0];
            if (kind in kinds) kinds[kind].endpoints.push(endpoint.name);
            else errors.push([
                kind,
                endpoint.name
            ]);
        } else {
            kinds['_unspecified_'].endpoints.push(endpoint.name);
        }
    }
    if (errors.length > 0) throw Error('\n  ' + errors.map((e)=>`Unknown kind (permission) "${e[0]}" found at ${e[1]}.`).join('\n  '));
    return kinds;
}
function getDescription(lang = 'ja-JP') {
    const permissionTable = Object.entries(kinds()).map((e)=>`|${e[0]}|${e[1].descs[lang]}|${e[1].endpoints.map((f)=>`[${f}](#operation/${f})`).join(', ')}|`).join('\n');
    const descriptions = {
        'ja-JP': `**Misskey is a decentralized microblogging platform.**

# Permissions
|Permisson (kind)|Description|Endpoints|
|:--|:--|:--|
${permissionTable}
`
    };
    return lang in descriptions ? descriptions[lang] : descriptions['ja-JP'];
}

//# sourceMappingURL=description.js.map
