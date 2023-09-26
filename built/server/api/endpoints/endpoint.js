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
const _define = require("../define");
const _endpoints = require("../endpoints");
const meta = {
    requireCredential: false,
    allowGet: true,
    tags: [
        'meta'
    ],
    params: {
        endpoint: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const ep = _endpoints.default.find((x)=>x.name === ps.endpoint);
    if (ep == null) return;
    return {
        params: Object.entries(ep.meta.params || {}).map(([k, v])=>genParaDesc(k, v)),
        desc: ep.meta.desc,
        limit: ep.meta.limit,
        allowGet: !!ep.meta.allowGet,
        requireAdmin: !!ep.meta.requireAdmin,
        requireCredential: !!ep.meta.requireCredential,
        requireModerator: !!ep.meta.requireModerator,
        secure: !!ep.meta.secure
    };
});
const isNumberContext = (c)=>c.name === 'Number';
const isStringContext = (c)=>c.name === 'String';
function genParaDesc(name, param) {
    const result = {
        name,
        type: param.validator.name === 'ID' ? 'String' : param.validator.name,
        desc: param.desc,
        deprecated: !!param.deprecated,
        default: param.default,
        required: !param.validator.isOptional
    };
    if (isNumberContext(param.validator)) {
        result.minimum = param.validator.minimum;
        result.maximum = param.validator.maximum;
    } else if (isStringContext(param.validator)) {
        if (param.validator.enum) {
            result.enum = param.validator.enum;
        } else {
            result.minimum = param.validator.minLength;
            result.maximum = param.validator.maxLength;
        }
    }
    return result;
}

//# sourceMappingURL=endpoint.js.map
