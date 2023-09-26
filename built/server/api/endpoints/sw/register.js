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
const _swsubscription = require("../../../../models/sw-subscription");
const _define = require("../../define");
const _fetchmeta = require("../../../../misc/fetch-meta");
const meta = {
    tags: [
        'account'
    ],
    requireCredential: true,
    params: {
        endpoint: {
            validator: _cafy.default.str
        },
        auth: {
            validator: _cafy.default.str
        },
        publickey: {
            validator: _cafy.default.str
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // if already subscribed
    const exist = await _swsubscription.default.findOne({
        userId: user._id,
        endpoint: ps.endpoint,
        auth: ps.auth,
        publickey: ps.publickey,
        deletedAt: {
            $exists: false
        }
    });
    const instance = await (0, _fetchmeta.default)();
    if (exist != null) {
        return {
            state: 'already-subscribed',
            key: instance.swPublicKey
        };
    }
    await _swsubscription.default.insert({
        userId: user._id,
        endpoint: ps.endpoint,
        auth: ps.auth,
        publickey: ps.publickey
    });
    return {
        state: 'subscribed',
        key: instance.swPublicKey
    };
});

//# sourceMappingURL=register.js.map
