"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _accesstoken = require("./access-token");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _config = require("../config");
const _logger = require("../db/logger");
const App = _mongodb1.default.get('apps');
App.createIndex('secret');
const _default = App;
const pack = async (app, me, options)=>{
    const opts = Object.assign({
        detail: false,
        includeSecret: false,
        includeProfileImageIds: false
    }, options);
    let _app;
    const fields = opts.detail ? {} : {
        name: true
    };
    // Populate the app if 'app' is ID
    if ((0, _isobjectid.default)(app)) {
        _app = await App.findOne({
            _id: app
        }, {
            fields
        });
    } else if (typeof app === 'string') {
        _app = await App.findOne({
            _id: new _mongodb.ObjectID(app)
        }, {
            fields
        });
    } else {
        _app = _deepcopy(app);
    }
    // Me
    if (me && !(0, _isobjectid.default)(me)) {
        if (typeof me === 'string') {
            me = new _mongodb.ObjectID(me);
        } else {
            me = me._id;
        }
    }
    // (データベースの欠損などで)アプリがデータベース上に見つからなかったとき
    if (_app == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: app :: ${app}`);
        return null;
    }
    // Rename _id to id
    _app.id = _app._id;
    delete _app._id;
    // Visible by only owner
    if (!opts.includeSecret) {
        delete _app.secret;
    }
    _app.iconUrl = _app.icon != null ? `${_config.default.driveUrl}/${_app.icon}` : `${_config.default.driveUrl}/app-default.jpg`;
    if (me) {
        // 既に連携しているか
        const exist = await _accesstoken.default.count({
            appId: _app.id,
            userId: me
        }, {
            limit: 1
        });
        _app.isAuthorized = exist === 1;
    }
    return _app;
};

//# sourceMappingURL=app.js.map
