"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _cafy = require("cafy");
const _bcryptjs = require("bcryptjs");
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _generatenativeusertoken = require("../../common/generate-native-user-token");
const _define = require("../../define");
const _serverevent = require("../../../../services/server-event");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        password: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Compare password
    const same = await _bcryptjs.compare(ps.password, user.password);
    if (!same) {
        throw new Error('incorrect password');
    }
    // Generate secret
    const secret = (0, _generatenativeusertoken.default)();
    await _user.default.update(user._id, {
        $set: {
            'token': secret
        }
    });
    // Publish event
    (0, _stream.publishMainStream)(user._id, 'myTokenRegenerated');
    // Terminate streaming
    setTimeout(()=>{
        (0, _serverevent.publishTerminate)(user._id);
    }, 5000);
    return;
});

//# sourceMappingURL=regenerate-token.js.map
