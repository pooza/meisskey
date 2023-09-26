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
const _define = require("../../define");
const _cafyid = require("../../../../misc/cafy-id");
const _accesstoken = require("../../../../models/access-token");
const _serverevent = require("../../../../services/server-event");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        tokenId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のtokenのID',
                'en-US': 'Target token ID'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await _accesstoken.default.remove({
        _id: ps.tokenId,
        userId: user._id
    });
    // Terminate streaming
    (0, _serverevent.publishTerminate)(user._id);
});

//# sourceMappingURL=revoke-token.js.map
