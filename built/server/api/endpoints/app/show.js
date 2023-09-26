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
const _cafyid = require("../../../../misc/cafy-id");
const _app = require("../../../../models/app");
const _define = require("../../define");
const _error = require("../../error");
const meta = {
    tags: [
        'app'
    ],
    params: {
        appId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        }
    },
    errors: {
        noSuchApp: {
            message: 'No such app.',
            code: 'NO_SUCH_APP',
            id: 'dce83913-2dc6-4093-8a7b-71dbb11718a3'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user, app)=>{
    const isSecure = user != null && app == null;
    // Lookup app
    const ap = await _app.default.findOne({
        _id: ps.appId
    });
    if (ap === null) {
        throw new _error.ApiError(meta.errors.noSuchApp);
    }
    return await (0, _app.pack)(ap, user, {
        detail: true,
        includeSecret: isSecure && ap.userId.equals(user._id)
    });
});

//# sourceMappingURL=show.js.map
