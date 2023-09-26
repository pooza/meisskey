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
const _define = require("../../define");
const _abuseuserreport = require("../../../../models/abuse-user-report");
const meta = {
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        reportId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const report = await _abuseuserreport.default.findOne({
        _id: ps.reportId
    });
    if (report == null) {
        throw new Error('report not found');
    }
    await _abuseuserreport.default.remove({
        _id: report._id
    });
    return;
});

//# sourceMappingURL=remove-abuse-user-report.js.map
