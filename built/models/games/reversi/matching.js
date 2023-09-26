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
const _mongodb1 = require("../../../db/mongodb");
const _isobjectid = require("../../../misc/is-objectid");
const _user = require("../../user");
const Matching = _mongodb1.default.get('reversiMatchings');
const _default = Matching;
const pack = (matching, me)=>new Promise(async (resolve, reject)=>{
        // Me
        const meId = me ? (0, _isobjectid.default)(me) ? me : typeof me === 'string' ? new _mongodb.ObjectID(me) : me._id : null;
        const _matching = _deepcopy(matching);
        // Rename _id to id
        _matching.id = _matching._id;
        delete _matching._id;
        // Populate user
        _matching.parent = await (0, _user.pack)(_matching.parentId, meId);
        _matching.child = await (0, _user.pack)(_matching.childId, meId);
        resolve(_matching);
    });

//# sourceMappingURL=matching.js.map
