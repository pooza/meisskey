/**
 * API Server
 */ "use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _koa = require("koa");
const _router = require("@koa/router");
const _multer = require("@koa/multer");
const _koabodyparser = require("koa-bodyparser");
const _cors = require("@koa/cors");
const _endpoints = require("./endpoints");
const _apihandler = require("./api-handler");
const _signup = require("./private/signup");
const _signin = require("./private/signin");
const _discord = require("./service/discord");
const _github = require("./service/github");
const _twitter = require("./service/twitter");
const _instance = require("../../models/instance");
const _converthost = require("../../misc/convert-host");
const _array = require("../../prelude/array");
const _config = require("../../config");
// Init app
const app = new _koa();
// Handle error
app.use(async (ctx, next)=>{
    try {
        await next();
    } catch (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            ctx.throw('File to large', 413);
            return;
        }
        ctx.app.emit('error', err, ctx);
    }
});
// CORS
if (_config.default.disableApiCors === true) {
// do nothing
} else {
    app.use(_cors({
        origin: '*'
    }));
}
// No caching
app.use(async (ctx, next)=>{
    ctx.set('Cache-Control', 'private, max-age=0, must-revalidate');
    await next();
});
app.use(_koabodyparser({
    // リクエストが multipart/form-data でない限りはJSONだと見なす
    detectJSON: (ctx)=>!ctx.is('multipart/form-data')
}));
// Init multer instance
const upload = _multer({
    storage: _multer.diskStorage({}),
    limits: {
        fileSize: _config.default.maxFileSize || 262144000,
        files: 1
    }
});
// Init router
const router = new _router();
/**
 * Register endpoint handlers
 */ for (const endpoint of _endpoints.default){
    if (endpoint.meta.requireFile) {
        router.post(`/${endpoint.name}`, upload.single('file'), _apihandler.default.bind(null, endpoint));
    } else {
        if (endpoint.name.includes('-')) {
            // 後方互換性のため
            router.post(`/${endpoint.name.replace(/\-/g, '_')}`, _apihandler.default.bind(null, endpoint));
        }
        router.post(`/${endpoint.name}`, _apihandler.default.bind(null, endpoint));
        if (endpoint.meta.allowGet) {
            router.get(`/${endpoint.name}`, _apihandler.default.bind(null, endpoint));
        } else {
            router.get(`/${endpoint.name}`, async (ctx)=>{
                ctx.status = 405;
            });
        }
    }
}
router.post('/signup', _signup.default);
router.post('/signin', _signin.default);
router.use(_discord.default.routes());
router.use(_github.default.routes());
router.use(_twitter.default.routes());
router.get('/v1/instance/peers', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    const instances = await _instance.default.find({}, {
        host: 1
    });
    const punyCodes = (0, _array.unique)(instances.map((instance)=>(0, _converthost.toApHost)(instance.host)));
    ctx.body = punyCodes;
    ctx.set('Cache-Control', 'public, max-age=600');
});
// Return 404 for unknown API
router.all('*', async (ctx)=>{
    ctx.status = 404;
});
// Register router
app.use(router.routes());
const _default = app;

//# sourceMappingURL=index.js.map
