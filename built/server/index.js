/* eslint-disable node/no-sync */ /**
 * Core Server
 */ "use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    serverLogger: function() {
        return serverLogger;
    },
    startServer: function() {
        return startServer;
    },
    default: function() {
        return _default;
    }
});
const _http = require("http");
const _fs = require("fs");
const _cluster = require("cluster");
const _koa = require("koa");
const _router = require("@koa/router");
const _koamount = require("koa-mount");
const _koalogger = require("koa-logger");
const _requeststats = require("request-stats");
const _koaslow = require("koa-slow");
const _activitypub = require("./activitypub");
const _nodeinfo = require("./nodeinfo");
const _wellknown = require("./well-known");
const _config = require("../config");
const _network = require("../services/chart/network");
const _api = require("./api");
const _array = require("../prelude/array");
const _user = require("../models/user");
const _logger = require("../services/logger");
const _env = require("../env");
const _parse = require("../misc/acct/parse");
const _resolveuser = require("../remote/resolve-user");
const _getdrivefileurl = require("../misc/get-drive-file-url");
const _drivefile = require("../models/drive-file");
const serverLogger = new _logger.default('server', 'gray', false);
// Init app
const app = new _koa();
app.proxy = true;
app.maxIpsCount = 1;
var _config_proxyIpHeader;
app.proxyIpHeader = (_config_proxyIpHeader = _config.default.proxyIpHeader) !== null && _config_proxyIpHeader !== void 0 ? _config_proxyIpHeader : 'X-Forwarded-For';
if (![
    'production',
    'test'
].includes(process.env.NODE_ENV || 'development')) {
    // Logger
    app.use(_koalogger((str)=>{
        serverLogger.info(str);
    }));
    // Delay
    if (_env.envOption.slow) {
        app.use(_koaslow({
            delay: 3000
        }));
    }
}
// HSTS
// 6months (15552000sec)
if (_config.default.url.startsWith('https') && !_config.default.disableHsts) {
    app.use(async (ctx, next)=>{
        ctx.set('strict-transport-security', 'max-age=15552000; preload');
        await next();
    });
}
// Default Security Headers (各ルートで上書き可)
app.use(async (ctx, next)=>{
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('X-Frame-Options', 'DENY');
    ctx.set('Content-Security-Policy', `default-src 'none'`);
    await next();
});
app.use(_koamount('/api', _api.default));
app.use(_koamount('/files', require('./file')));
app.use(_koamount('/proxy', require('./proxy')));
// Init router
const router = new _router();
// Routing
router.use(_activitypub.default.routes());
router.use(_nodeinfo.default.routes());
router.use(_wellknown.default.routes());
router.get('/avatar/@:acct', async (ctx)=>{
    var _user;
    const { username, host } = (0, _parse.default)(ctx.params.acct);
    const user = await (0, _resolveuser.default)(username, host).catch(()=>null);
    const url = ((_user = user) === null || _user === void 0 ? void 0 : _user.avatarId) ? (0, _getdrivefileurl.default)(await _drivefile.default.findOne({
        _id: user.avatarId
    }), true) : null;
    if (url) {
        ctx.set('Cache-Control', 'public, max-age=300');
        ctx.redirect(url);
    } else {
        ctx.set('Cache-Control', 'public, max-age=300');
        ctx.redirect(`${_config.default.driveUrl}/default-avatar.jpg`);
    }
});
router.get('/verify-email/:code', async (ctx)=>{
    const user = await _user.default.findOne({
        emailVerifyCode: ctx.params.code
    });
    if (user != null) {
        ctx.body = 'Verify succeeded!';
        ctx.status = 200;
        _user.default.update({
            _id: user._id
        }, {
            $set: {
                emailVerified: true,
                emailVerifyCode: null
            }
        });
    } else {
        ctx.status = 404;
    }
});
// Register router
app.use(router.routes());
app.use(_koamount(require('./web')));
function createServer() {
    return _http.createServer(app.callback());
}
const startServer = ()=>{
    const server = createServer();
    // Init stream server
    require('./api/streaming')(server);
    // Listen
    server.listen(_config.default.port, _config.default.addr || undefined);
    return server;
};
const _default = ()=>new Promise((resolve)=>{
        const server = createServer();
        // Init stream server
        require('./api/streaming')(server);
        server.on('error', (e)=>{
            switch(e.code){
                case 'EACCES':
                    serverLogger.error(`You do not have permission to listen on port ${_config.default.port}.`);
                    break;
                case 'EADDRINUSE':
                    serverLogger.error(`Port ${_config.default.port} is already in use by another process.`);
                    break;
                default:
                    serverLogger.error(e);
                    break;
            }
            if (_cluster.isWorker) {
                process.send('listenFailed');
            } else {
                // disableClustering
                process.exit(1);
            }
        });
        // Listen
        if (_config.default.socket) {
            try {
                _fs.unlinkSync(_config.default.socket);
            } catch (e) {}
            server.listen({
                path: _config.default.socket
            }, resolve);
            _fs.chmodSync(_config.default.socket, '777');
        } else {
            server.listen({
                port: _config.default.port,
                host: _config.default.addr || undefined
            }, resolve);
        }
        //#region Network stats
        let queue = [];
        _requeststats(server, (stats)=>{
            if (stats.ok) {
                queue.push(stats);
            }
        });
        // Bulk write
        setInterval(()=>{
            if (queue.length == 0) return;
            const requests = queue.length;
            const time = (0, _array.sum)(queue.map((x)=>x.time));
            const incomingBytes = (0, _array.sum)(queue.map((x)=>x.req.byets));
            const outgoingBytes = (0, _array.sum)(queue.map((x)=>x.res.byets));
            queue = [];
            _network.default.update(requests, time, incomingBytes, outgoingBytes);
        }, 5000);
    //#endregion
    });

//# sourceMappingURL=index.js.map
