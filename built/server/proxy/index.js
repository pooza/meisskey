/**
 * Media Proxy
 */ "use strict";
const _koa = require("koa");
const _router = require("@koa/router");
const _proxymedia = require("./proxy-media");
// Init app
const app = new _koa();
app.use(async (ctx, next)=>{
    ctx.set('Content-Security-Policy', `default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'`);
    await next();
});
// Init router
const router = new _router();
router.get('/:url*', _proxymedia.proxyMedia);
// Register router
app.use(router.routes());
module.exports = app;

//# sourceMappingURL=index.js.map
