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
const _user = require("../../../../models/user");
const _stream = require("../../../../services/stream");
const _define = require("../../define");
const meta = {
    requireCredential: true,
    secure: true,
    params: {
        name: {
            validator: _cafy.default.str
        },
        value: {
            validator: _cafy.default.nullable.any
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    const x = {};
    x[`clientSettings.${ps.name}`] = ps.value;
    await _user.default.update(user._id, {
        $set: x
    });
    // Publish event
    (0, _stream.publishMainStream)(user._id, 'clientSettingUpdated', {
        key: ps.name,
        value: ps.value
    });
    return;
});

//# sourceMappingURL=update-client-setting.js.map
