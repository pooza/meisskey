"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Connection;
    }
});
const _autobinddecorator = require("autobind-decorator");
const _ws = require("ws");
const _user = require("../../../models/user");
const _readnotification = require("../common/read-notification");
const _call = require("../call");
const _read = require("../../../services/note/read");
const _channels = require("./channels");
const _gethideusers = require("../common/get-hide-users");
const _stream = require("../../../services/stream");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Connection = class Connection {
    /**
	 * クライアントからメッセージ受信時
	 */ async onWsConnectionMessage(data) {
        if (data == null) return;
        if (data.toString() === 'ping') return;
        const { type, body } = JSON.parse(data.toString());
        switch(type){
            case 'api':
                this.onApiRequest(body);
                break;
            case 'readNotification':
                this.onReadNotification(body);
                break;
            case 'subNote':
                this.onSubscribeNote(body);
                break;
            case 'sn':
                this.onSubscribeNote(body);
                break; // alias
            case 'unsubNote':
                this.onUnsubscribeNote(body);
                break;
            case 'un':
                this.onUnsubscribeNote(body);
                break; // alias
            case 'connect':
                this.onChannelConnectRequested(body);
                break;
            case 'disconnect':
                this.onChannelDisconnectRequested(body);
                break;
            case 'channel':
                this.onChannelMessageRequested(body);
                break;
            case 'ch':
                this.onChannelMessageRequested(body);
                break; // alias
        }
    }
    /**
	 * APIリクエスト要求時
	 */ async onApiRequest(payload) {
        // 新鮮なデータを利用するためにユーザーをフェッチ
        const user = this.user ? await _user.default.findOne({
            _id: this.user._id
        }) : null;
        const endpoint = payload.endpoint || payload.ep; // alias
        // 呼び出し
        (0, _call.default)(endpoint, user, this.app, payload.data).then((res)=>{
            this.sendMessageToWs(`api:${payload.id}`, {
                res
            });
        }).catch((e)=>{
            this.sendMessageToWs(`api:${payload.id}`, {
                error: _object_spread({
                    message: e.message,
                    code: e.code,
                    id: e.id,
                    kind: e.kind
                }, e.info ? {
                    info: e.info
                } : {})
            });
        });
    }
    onReadNotification(payload) {
        if (!payload.id) return;
        (0, _readnotification.default)(this.user._id, payload.id);
    }
    /**
	 * 投稿購読要求時
	 */ onSubscribeNote(payload) {
        if (!payload.id) return;
        if (this.subscribingNotes[payload.id] == null) {
            this.subscribingNotes[payload.id] = 0;
        }
        this.subscribingNotes[payload.id]++;
        if (this.subscribingNotes[payload.id] == 1) {
            this.subscriber.on(`noteStream:${payload.id}`, this.onNoteStreamMessage);
        }
        if (payload.read) {
            (0, _read.default)(this.user._id, payload.id);
        }
    }
    /**
	 * 投稿購読解除要求時
	 */ onUnsubscribeNote(payload) {
        if (!payload.id) return;
        this.subscribingNotes[payload.id]--;
        if (this.subscribingNotes[payload.id] <= 0) {
            delete this.subscribingNotes[payload.id];
            this.subscriber.off(`noteStream:${payload.id}`, this.onNoteStreamMessage);
        }
    }
    async onNoteStreamMessage(data) {
        this.sendMessageToWs('noteUpdated', {
            id: data.body.id,
            type: data.type,
            body: data.body.body
        });
    }
    /**
	 * チャンネル接続要求時
	 */ onChannelConnectRequested(payload) {
        const { channel, id, params, pong } = payload;
        this.connectChannel(id, params, channel, pong);
    }
    /**
	 * チャンネル切断要求時
	 */ onChannelDisconnectRequested(payload) {
        const { id } = payload;
        this.disconnectChannel(id);
    }
    /**
	 * クライアントにメッセージ送信
	 */ sendMessageToWs(type, payload) {
        if (this.sendMessageToWsOverride) return this.sendMessageToWsOverride(type, payload); // 後方互換性のため
        this.wsConnection.send(JSON.stringify({
            type: type,
            body: payload
        }));
    }
    /**
	 * チャンネルに接続
	 */ connectChannel(id, params, channel, pong = false) {
        if (_channels.default[channel].requireCredential && this.user == null) {
            return;
        }
        const ch = new _channels.default[channel](id, this);
        this.channels.push(ch);
        ch.init(params);
        if (pong) {
            this.sendMessageToWs('connected', {
                id: id
            });
        }
    }
    /**
	 * チャンネルから切断
	 * @param id チャンネルコネクションID
	 */ disconnectChannel(id) {
        const channel = this.channels.find((c)=>c.id === id);
        if (channel) {
            if (channel.dispose) channel.dispose();
            this.channels = this.channels.filter((c)=>c.id !== id);
        }
    }
    /**
	 * チャンネルへメッセージ送信要求時
	 * @param data メッセージ
	 */ onChannelMessageRequested(data) {
        const channel = this.channels.find((c)=>c.id === data.id);
        if (channel != null && channel.onMessage != null) {
            channel.onMessage(data.type, data.body);
        }
    }
    async onServerEvent(data) {
        if (data.type === 'mutingChanged') {
            this.updateMuting();
        }
        if (data.type === 'terminate') {
            this.wsConnection.close();
            this.dispose();
        }
    }
    async updateMuting() {
        var _this_user;
        const hides = await (0, _gethideusers.getHideUserIdsById)((_this_user = this.user) === null || _this_user === void 0 ? void 0 : _this_user._id, true, false);
        this.muting = hides.map((x)=>`${x}`);
    }
    /**
	 * ストリームが切れたとき
	 */ dispose() {
        for (const c of this.channels.filter((c)=>c.dispose)){
            c.dispose();
        }
        if (this.user) this.subscriber.off(`serverEvent:${this.user._id}`, this.onServerEvent);
    }
    constructor(wsConnection, subscriber, user, app){
        _define_property(this, "user", void 0);
        _define_property(this, "app", void 0);
        _define_property(this, "wsConnection", void 0);
        _define_property(this, "subscriber", void 0);
        _define_property(this, "channels", []);
        _define_property(this, "subscribingNotes", {});
        _define_property(this, "sendMessageToWsOverride", null) // 後方互換性のため
        ;
        _define_property(this, "muting", []);
        this.wsConnection = wsConnection;
        this.user = user;
        this.app = app;
        this.subscriber = subscriber;
        this.wsConnection.on('message', this.onWsConnectionMessage);
        if (this.user) {
            this.updateMuting();
            this.subscriber.on(`serverEvent:${this.user._id}`, this.onServerEvent);
        }
    }
};
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _ws === "undefined" || typeof _ws.RawData === "undefined" ? Object : _ws.RawData
    ])
], Connection.prototype, "onWsConnectionMessage", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onApiRequest", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onReadNotification", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onSubscribeNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onUnsubscribeNote", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _stream.PubSubMessage === "undefined" ? Object : _stream.PubSubMessage
    ])
], Connection.prototype, "onNoteStreamMessage", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onChannelConnectRequested", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onChannelDisconnectRequested", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ])
], Connection.prototype, "sendMessageToWs", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        String,
        void 0
    ])
], Connection.prototype, "connectChannel", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ])
], Connection.prototype, "disconnectChannel", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], Connection.prototype, "onChannelMessageRequested", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _stream.PubSubMessage === "undefined" ? Object : _stream.PubSubMessage
    ])
], Connection.prototype, "onServerEvent", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], Connection.prototype, "updateMuting", null);
_ts_decorate([
    _autobinddecorator.default,
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], Connection.prototype, "dispose", null);

//# sourceMappingURL=index.js.map
