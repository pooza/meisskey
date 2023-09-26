"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _authenticate = require("./authenticate");
const _call = require("./call");
const _error = require("./error");
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
const _default = (endpoint, ctx)=>new Promise((res)=>{
        const body = ctx.method === 'GET' ? ctx.query : ctx.request.body;
        const reply = (x, y)=>{
            if (x == null) {
                ctx.status = 204;
            } else if (typeof x === 'number') {
                var _y, _y1, _y2, _y3, _y4;
                ctx.status = x;
                ctx.body = {
                    error: _object_spread({
                        message: (_y = y) === null || _y === void 0 ? void 0 : _y.message,
                        code: (_y1 = y) === null || _y1 === void 0 ? void 0 : _y1.code,
                        id: (_y2 = y) === null || _y2 === void 0 ? void 0 : _y2.id,
                        kind: (_y3 = y) === null || _y3 === void 0 ? void 0 : _y3.kind
                    }, ((_y4 = y) === null || _y4 === void 0 ? void 0 : _y4.info) && y.kind === 'client' ? {
                        info: y.info
                    } : {})
                };
            } else {
                ctx.body = x;
            }
            res();
        };
        // Authentication
        (0, _authenticate.default)(body['i']).then(([user, app])=>{
            // API invoking
            (0, _call.default)(endpoint.name, user, app, body, ctx).then((res)=>{
                if (ctx.method === 'GET' && endpoint.meta.cacheSec && !body['i'] && !user && !app) {
                    ctx.set('Cache-Control', `public, max-age=${endpoint.meta.cacheSec}`);
                }
                reply(res);
            }).catch((e)=>{
                reply(e.httpStatusCode ? e.httpStatusCode : e.kind == 'client' ? 400 : 500, e);
            });
        }).catch((e)=>{
            if (e instanceof _authenticate.AuthenticationError) {
                reply(403, new _error.ApiError({
                    message: 'Authentication failed. Please ensure your token is correct.',
                    code: 'AUTHENTICATION_FAILED',
                    id: 'b0a7f5f8-dc2f-4171-b91f-de88ad238e14'
                }));
            } else {
                reply(500, new _error.ApiError());
            }
        });
    });

//# sourceMappingURL=api-handler.js.map
