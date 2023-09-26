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
const _deepcopy = require("deepcopy");
const _mongodb = require("../db/mongodb");
const Signin = _mongodb.default.get('signin');
const _default = Signin;
const pack = async (record)=>{
    const _record = _deepcopy(record);
    // Rename _id to id
    _record.id = _record._id;
    delete _record._id;
    return _record;
};

//# sourceMappingURL=signin.js.map
