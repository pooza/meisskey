"use strict";
Object.defineProperty(exports, "genOpenapiSpec", {
    enumerable: true,
    get: function() {
        return genOpenapiSpec;
    }
});
const _endpoints = require("../endpoints");
const _config = require("../../../config");
const _errors = require("./errors");
const _schemas = require("./schemas");
const _schema = require("../../../misc/schema");
const _description = require("./description");
const _constjson = require("../../../const.json");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function genOpenapiSpec(lang = 'ja-JP') {
    const spec = {
        openapi: '3.0.0',
        info: {
            version: 'v1',
            title: 'Misskey API',
            description: (0, _description.getDescription)(lang),
            'x-logo': {
                url: '/assets/api-doc.png'
            }
        },
        externalDocs: {
            description: 'Repository',
            url: _constjson.repositoryUrl
        },
        servers: [
            {
                url: _config.default.apiUrl
            }
        ],
        paths: {},
        components: {
            schemas: _schemas.schemas,
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'body',
                    name: 'i'
                }
            }
        }
    };
    function genProps(props) {
        const properties = {};
        for (const [k, v] of Object.entries(props)){
            properties[k] = genProp(v);
        }
        return properties;
    }
    function genProp(param) {
        const required = param.name === 'Object' ? param.props ? Object.entries(param.props).filter(([k, v])=>!v.isOptional).map(([k, v])=>k) : [] : [];
        return _object_spread(_object_spread_props(_object_spread(_object_spread_props(_object_spread({
            description: (param.data || {}).desc,
            default: (param.data || {}).default,
            deprecated: (param.data || {}).deprecated
        }, (param.data || {}).default ? {
            default: (param.data || {}).default
        } : {}), {
            type: param.name === 'ID' ? 'string' : param.name.toLowerCase()
        }), param.name === 'ID' ? {
            example: 'xxxxxxxxxxxxxxxxxxxxxxxx',
            format: 'id'
        } : {}), {
            nullable: param.isNullable
        }), param.name === 'String' ? _object_spread({}, param.enum ? {
            enum: param.enum
        } : {}, param.minLength ? {
            minLength: param.minLength
        } : {}, param.maxLength ? {
            maxLength: param.maxLength
        } : {}) : {}, param.name === 'Number' ? _object_spread({}, param.minimum ? {
            minimum: param.minimum
        } : {}, param.maximum ? {
            maximum: param.maximum
        } : {}) : {}, param.name === 'Object' ? _object_spread_props(_object_spread({}, required.length > 0 ? {
            required
        } : {}), {
            properties: param.props ? genProps(param.props) : {}
        }) : {}, param.name === 'Array' ? {
            items: param.ctx ? genProp(param.ctx) : {}
        } : {});
    }
    for (const endpoint of _endpoints.default.filter((ep)=>!ep.meta.secure && !ep.name.startsWith('admin/'))){
        const porops = {};
        const errors = {};
        if (endpoint.meta.errors) {
            for (const e of Object.values(endpoint.meta.errors)){
                errors[e.code] = {
                    value: {
                        error: e
                    }
                };
            }
        }
        if (endpoint.meta.params) {
            for (const [k, v] of Object.entries(endpoint.meta.params)){
                if (v.validator.data == null) v.validator.data = {};
                if (v.desc) v.validator.data.desc = v.desc[lang];
                if (v.deprecated) v.validator.data.deprecated = v.deprecated;
                if (v.default) v.validator.data.default = v.default;
                porops[k] = v.validator;
            }
        }
        const required = endpoint.meta.params ? Object.entries(endpoint.meta.params).filter(([k, v])=>!v.validator.isOptional).map(([k, v])=>k) : [];
        const schema = _object_spread_props(_object_spread({
            type: 'object'
        }, required.length > 0 ? {
            required
        } : {}), {
            properties: endpoint.meta.params ? genProps(porops) : {}
        });
        const resSchema = endpoint.meta.res ? (0, _schema.convertOpenApiSchema)(endpoint.meta.res) : {};
        let desc = (endpoint.meta.desc ? endpoint.meta.desc[lang] : 'No description provided.') + '\n\n';
        desc += `**Credential required**: *${endpoint.meta.requireCredential ? 'Yes' : 'No'}*`;
        if (endpoint.meta.kind) {
            const kind = endpoint.meta.kind;
            desc += ` / **Permission**: *${kind}*`;
        }
        if (endpoint.meta.requireAdmin) {
            desc += ' / Require admin';
        }
        if (endpoint.meta.requireModerator) {
            desc += ' / Require moderator';
        }
        if (endpoint.meta.allowGet) {
            desc += ' / GET Supported';
        }
        if (endpoint.meta.secure) {
            desc += ' / Secure';
        }
        const info = _object_spread_props(_object_spread({
            operationId: endpoint.name,
            summary: endpoint.name,
            description: desc,
            externalDocs: {
                description: 'Source code',
                url: `${_constjson.repositoryUrl}/src/server/api/endpoints/${endpoint.name}.ts`
            }
        }, endpoint.meta.tags ? {
            tags: [
                endpoint.meta.tags[0]
            ]
        } : {}, endpoint.meta.requireCredential ? {
            security: [
                {
                    ApiKeyAuth: []
                }
            ]
        } : {}), {
            requestBody: {
                required: true,
                content: endpoint.meta.requireFile ? {
                    'multipart/form-data': {
                        schema
                    }
                } : {
                    'application/json': {
                        schema
                    }
                }
            },
            responses: _object_spread_props(_object_spread({}, endpoint.meta.res ? {
                '200': {
                    description: 'OK (with results)',
                    content: {
                        'application/json': {
                            schema: resSchema
                        }
                    }
                }
            } : {
                '204': {
                    description: 'OK (without any results)'
                }
            }), {
                '400': {
                    description: 'Client error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            examples: _object_spread({}, errors, _errors.errors['400'])
                        }
                    }
                }
            })
        });
        spec.paths['/' + endpoint.name] = {
            post: info
        };
    }
    return spec;
}

//# sourceMappingURL=gen-spec.js.map
