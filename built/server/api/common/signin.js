"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _config = require("../../../config");
function _default(ctx, user, redirect = false) {
    if (redirect) {
        //#region Cookie
        const expires = 1000 * 60 * 60 * 24 * 365; // One Year
        ctx.cookies.set('i', user.token, {
            path: '/',
            // SEE: https://github.com/koajs/koa/issues/974
            // When using a SSL proxy it should be configured to add the "X-Forwarded-Proto: https" header
            secure: _config.default.url.startsWith('https'),
            httpOnly: false,
            expires: new Date(Date.now() + expires),
            maxAge: expires
        });
        //#endregion
        // Cache-Controlは/api/でprivateになっている
        ctx.redirect(_config.default.url);
    } else {
        ctx.body = {
            i: user.token
        };
        ctx.status = 200;
    }
}

//# sourceMappingURL=signin.js.map
