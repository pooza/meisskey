"use strict";
Object.defineProperty(exports, "streamLogger", {
    enumerable: true,
    get: function() {
        return streamLogger;
    }
});
const _ws = require("ws");
const _servereventemitter = require("../../services/server-event-emitter");
const _stream = require("./stream");
const _authenticate = require("./authenticate");
const _events = require("events");
const _logger = require("../../services/logger");
const _activeusers = require("../../services/chart/active-users");
const _querystring = require("querystring");
const _rndstr = require("rndstr");
const streamLogger = new _logger.default('stream', 'cyan');
module.exports = (server)=>{
    const wss = new _ws.WebSocketServer({
        noServer: true
    });
    // 1. 認証
    server.on('upgrade', async (request, socket, head)=>{
        // Auth
        try {
            var _user, _user1;
            const [user, app] = await auth(request);
            if ((_user = user) === null || _user === void 0 ? void 0 : _user.isSuspended) {
                socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                socket.destroy();
                return;
            }
            if ((_user1 = user) === null || _user1 === void 0 ? void 0 : _user1.isDeleted) {
                socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                socket.destroy();
                return;
            }
            wss.handleUpgrade(request, socket, head, (ws)=>{
                const client = {
                    user,
                    app
                };
                wss.emit('connection', ws, request, client);
            });
        } catch (e) {
            if (e instanceof _authenticate.AuthenticationError) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            } else {
                streamLogger.error(e);
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
                return;
            }
        }
    });
    // 2. ユーザー認証後はここにくる
    wss.on('connection', (ws, request, client)=>{
        var _client_user;
        const userHash = (0, _rndstr.default)(8);
        streamLogger.debug(`[${userHash}] connect: user=${(_client_user = client.user) === null || _client_user === void 0 ? void 0 : _client_user.username}`);
        // init lastActive
        let lastActive = Date.now();
        const updateLastActive = ()=>{
            lastActive = Date.now();
        };
        updateLastActive();
        ws.on('error', (e)=>streamLogger.error(e));
        ws.on('message', (data)=>{
            streamLogger.debug(`[${userHash}] recv ${data}`);
            updateLastActive();
            // implement app layer ping
            if (data.toString() === 'ping') {
                streamLogger.debug(`[${userHash}] app pong`);
                ws.send('pong');
            }
        });
        // handle protocol layer pong from client
        ws.on('pong', ()=>{
            streamLogger.debug(`[${userHash}] recv pong`);
            updateLastActive();
        });
        // setup events
        const ev = new _events.EventEmitter();
        const onServerMessage = (parsed)=>{
            ev.emit(parsed.channel, parsed.message);
        };
        _servereventemitter.serverEventEmitter.on('message', onServerMessage);
        const main = new _stream.default(ws, ev, client.user, client.app);
        // 定期的にpingと無応答切断をする
        const intervalId = setInterval(()=>{
            streamLogger.debug(`[${userHash}] send ping`);
            ws.ping();
            if (Date.now() - lastActive > 10 * 60 * 1000) {
                var _client_user;
                streamLogger.warn(`[${userHash}] user=${(_client_user = client.user) === null || _client_user === void 0 ? void 0 : _client_user.username} timeout`);
                ws.terminate();
            }
        }, 1 * 60 * 1000);
        // 定期的にアクティブユーザーを更新する
        const intervalId2 = setInterval(()=>{
            if (client.user) {
                streamLogger.debug(`[${userHash}] update active user`);
                _activeusers.default.update(client.user);
            }
        }, 5 * 60 * 1000);
        ws.once('close', ()=>{
            streamLogger.debug(`[${userHash}] close`);
            ev.removeAllListeners();
            main.dispose();
            _servereventemitter.serverEventEmitter.off('message', onServerMessage);
            clearInterval(intervalId);
            clearInterval(intervalId2);
        });
    });
};
function auth(request) {
    if (!request.url) throw new Error('request.url is null');
    const qs = request.url.split('?')[1];
    if (!qs) return [
        null,
        null
    ];
    const q = _querystring.parse(qs);
    if (!q.i) return [
        null,
        null
    ];
    return (0, _authenticate.default)(q.i);
}

//# sourceMappingURL=streaming.js.map
