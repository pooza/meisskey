"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _fetchmeta = require("../misc/fetch-meta");
const _getnotesummary = require("../misc/get-note-summary");
const _swsubscription = require("../models/sw-subscription");
const _user = require("../models/user");
const _queue = require("../queue");
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
let swEnabled = false;
function update() {
    (0, _fetchmeta.default)().then((meta)=>{
        if (meta.enableServiceWorker && meta.swPublicKey && meta.swPrivateKey) {
            swEnabled = true;
        } else {
            swEnabled = false;
        }
    });
}
setInterval(()=>{
    update();
}, 30000);
update();
async function _default(userId, type, body) {
    var _body;
    if (!swEnabled) return;
    if (typeof userId === 'string') {
        userId = new _mongodb.ObjectID(userId);
    }
    const user = await _user.default.findOne({
        _id: userId
    });
    if (user == null || !(0, _user.isLocalUser)(user)) return;
    if ((_body = body) === null || _body === void 0 ? void 0 : _body.type) {
        var _user_settings;
        const enabled = (0, _user.getPushNotificationsValue)((_user_settings = user.settings) === null || _user_settings === void 0 ? void 0 : _user_settings.pushNotifications, body.type);
        if (!enabled) return;
    }
    const payload = {
        type,
        body: truncateNotification(body)
    };
    // Fetch
    const subscriptions = await _swsubscription.default.find({
        userId: userId
    });
    for (const subscription of subscriptions){
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                auth: subscription.auth,
                p256dh: subscription.publickey
            }
        };
        (0, _queue.webpushDeliver)({
            swSubscriptionId: subscription._id,
            pushSubscription,
            payload: JSON.stringify(payload)
        });
    }
}
function truncateNotification(notification) {
    if (notification.note) {
        return _object_spread_props(_object_spread({}, notification), {
            note: _object_spread_props(_object_spread({}, notification.note), {
                // textをgetNoteSummaryしたものに置き換える
                text: (0, _getnotesummary.default)(notification.type === 'renote' ? notification.note.renote : notification.note).substring(0, 3000),
                _truncated: true,
                cw: undefined,
                reply: undefined,
                renote: undefined,
                user: undefined
            })
        });
    }
    return notification;
}

//# sourceMappingURL=push-notification.js.map
