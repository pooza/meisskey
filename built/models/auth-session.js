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
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _app = require("./app");
const AuthSession = _mongodb1.default.get('authSessions');
const _default = AuthSession;
const pack = async (session, me)=>{
    let _session;
    // TODO: Populate session if it ID
    // eslint-disable-next-line prefer-const
    _session = _deepcopy(session);
    // Me
    if (me && !(0, _isobjectid.default)(me)) {
        if (typeof me === 'string') {
            me = new _mongodb.ObjectID(me);
        } else {
            me = me._id;
        }
    }
    delete _session._id;
    // Populate app
    _session.app = await (0, _app.pack)(_session.appId, me, {
        detail: true
    });
    return _session;
};

//# sourceMappingURL=auth-session.js.map
