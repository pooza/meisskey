/**
 * File Server
 */ "use strict";
const _fs = require("fs");
const _koa = require("koa");
const _router = require("@koa/router");
const _senddrivefile = require("./send-drive-file");
// Init app
const app = new _koa();
app.use(async (ctx, next)=>{
    ctx.set('Content-Security-Policy', `default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'`);
    await next();
});
// Init router
const router = new _router();
router.get('/default-avatar.jpg', (ctx)=>{
    const file = _fs.createReadStream(`${__dirname}/assets/avatar.jpg`);
    ctx.body = file;
    ctx.set('Content-Type', 'image/jpeg');
    ctx.set('Cache-Control', 'max-age=2592000, s-maxage=172800, immutable');
});
router.get('/app-default.jpg', (ctx)=>{
    const file = _fs.createReadStream(`${__dirname}/assets/dummy.png`);
    ctx.body = file;
    ctx.set('Content-Type', 'image/jpeg');
    ctx.set('Cache-Control', 'max-age=2592000, s-maxage=172800, immutable');
});
router.get('/:id', _senddrivefile.default);
router.get('/:id/*', _senddrivefile.default);
// Register router
app.use(router.routes());
module.exports = app;

//# sourceMappingURL=index.js.map
