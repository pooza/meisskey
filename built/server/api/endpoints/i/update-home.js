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
        home: {
            validator: _cafy.default.arr(_cafy.default.obj({
                name: _cafy.default.str,
                id: _cafy.default.str,
                place: _cafy.default.str,
                data: _cafy.default.obj()
            }).strict())
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    await _user.default.update(user._id, {
        $set: {
            'clientSettings.home': ps.home
        }
    });
    (0, _stream.publishMainStream)(user._id, 'homeUpdated', ps.home);
    return;
});

//# sourceMappingURL=update-home.js.map
