"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _perf_hooks = require("perf_hooks");
const _limiter = require("./limiter");
const _endpoints = require("./endpoints");
const _error = require("./error");
const _logger = require("./logger");
const _array = require("../../prelude/array");
const _activeusers = require("../../services/chart/active-users");
const _config = require("../../config");
const accessDenied = {
    message: 'Access denied.',
    code: 'ACCESS_DENIED',
    id: '56f35758-7dd5-468b-8439-5d6fb8ec9b8e'
};
const _default = async (endpoint, user, app, data, ctx)=>{
    var _ctx, _ctx1, _ctx2;
    const isSecure = user != null && app == null;
    const ep = _endpoints.default.find((e)=>e.name === endpoint);
    if (ep == null) {
        throw new _error.ApiError({
            message: 'No such endpoint.',
            code: 'NO_SUCH_ENDPOINT',
            id: 'f8080b67-5f9c-4eb7-8c18-7f1eeae8f709',
            httpStatusCode: 404
        });
    }
    if (ep.meta.secure && !isSecure) {
        throw new _error.ApiError(accessDenied);
    }
    if (ep.meta.requireCredential && user == null) {
        throw new _error.ApiError({
            message: 'Credential required.',
            code: 'CREDENTIAL_REQUIRED',
            id: '1384574d-a912-4b81-8601-c7b1c4085df1',
            httpStatusCode: 401
        });
    }
    if (ep.meta.requireCredential && user.isDeleted) {
        throw new _error.ApiError(accessDenied, {
            reason: 'Your account has been deleted.'
        });
    }
    if (ep.meta.requireCredential && user.isSuspended) {
        throw new _error.ApiError(accessDenied, {
            reason: 'Your account has been suspended.'
        });
    }
    if (ep.meta.requireAdmin && !user.isAdmin) {
        throw new _error.ApiError(accessDenied, {
            reason: 'You are not the admin.'
        });
    }
    if (ep.meta.requireModerator && !user.isAdmin && !user.isModerator) {
        throw new _error.ApiError(accessDenied, {
            reason: 'You are not a moderator.'
        });
    }
    if (app && ep.meta.kind && !app.permission.some((p)=>(0, _array.toArray)(ep.meta.kind).includes(p))) {
        throw new _error.ApiError({
            message: 'Your app does not have the necessary permissions to use this endpoint.',
            code: 'PERMISSION_DENIED',
            id: '1370e5b7-d4eb-4566-bb1d-7748ee6a1838'
        });
    }
    if (ep.meta.limit) {
        var _ctx3;
        // Rate limit
        await (0, _limiter.default)(ep, user, (_ctx3 = ctx) === null || _ctx3 === void 0 ? void 0 : _ctx3.ip).catch((e)=>{
            throw new _error.ApiError({
                message: 'Rate limit exceeded. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                id: 'd5826d14-3982-4d2e-8011-b9e9f02499ef',
                httpStatusCode: 429
            });
        });
    }
    if (ep.meta.canDenyPost && _config.default.denyStatsPost && ((_ctx = ctx) === null || _ctx === void 0 ? void 0 : _ctx.method) === 'POST') {
        throw new _error.ApiError({
            message: 'Method Not Allowed',
            code: 'METHOD_NOT_ALLOWED',
            id: 'a80e8552-bc3c-4dd5-9682-869a825e3716',
            httpStatusCode: 405
        });
    }
    // Cast non JSON input
    if ((ep.meta.requireFile || ((_ctx1 = ctx) === null || _ctx1 === void 0 ? void 0 : _ctx1.method) === 'GET') && ep.meta.params) {
        for (const k of Object.keys(ep.meta.params)){
            const param = ep.meta.params[k];
            if ([
                'Boolean',
                'Number'
            ].includes(param.validator.name) && typeof data[k] === 'string') {
                try {
                    data[k] = JSON.parse(data[k]);
                } catch (e) {
                    throw new _error.ApiError({
                        message: 'Invalid param.',
                        code: 'INVALID_PARAM',
                        id: '0b5f1631-7c1a-41a6-b399-cce335f34d85'
                    }, {
                        param: k,
                        reason: `cannot cast to ${param.validator.name}`
                    });
                }
            } else if (param.validator.name === 'Array' && typeof data[k] === 'string') {
                data[k] = data[k].split(',');
            }
        }
    }
    // API invoking
    const before = _perf_hooks.performance.now();
    return await ep.exec(data, user, app, (_ctx2 = ctx) === null || _ctx2 === void 0 ? void 0 : _ctx2.file).catch((e)=>{
        if (e instanceof _error.ApiError) {
            throw e;
        } else {
            var _e, _e1, _e2, _e3, _e4, _e5;
            console.error(e);
            _logger.apiLogger.error(`Internal error occurred in ${ep.name}`, {
                ep: ep.name,
                ps: data,
                e: {
                    message: (_e = e) === null || _e === void 0 ? void 0 : _e.message,
                    code: (_e1 = e) === null || _e1 === void 0 ? void 0 : _e1.name,
                    stack: (_e2 = e) === null || _e2 === void 0 ? void 0 : _e2.stack
                }
            });
            throw new _error.ApiError(null, {
                e: {
                    message: (_e3 = e) === null || _e3 === void 0 ? void 0 : _e3.message,
                    code: (_e4 = e) === null || _e4 === void 0 ? void 0 : _e4.name,
                    stack: (_e5 = e) === null || _e5 === void 0 ? void 0 : _e5.stack
                }
            });
        }
    }).finally(()=>{
        const after = _perf_hooks.performance.now();
        const time = after - before;
        if (time > 1000) {
            var _user;
            _logger.apiLogger.warn(`SLOW API CALL DETECTED: ${ep.name} user=${(_user = user) === null || _user === void 0 ? void 0 : _user.username} (${time}ms)`);
        }
        if (user) _activeusers.default.update(user);
    });
};

//# sourceMappingURL=call.js.map
