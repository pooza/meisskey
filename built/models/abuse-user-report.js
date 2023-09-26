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
    packMany: function() {
        return packMany;
    },
    pack: function() {
        return pack;
    }
});
const _mongodb = require("mongodb");
const _deepcopy = require("deepcopy");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _user = require("./user");
const _note = require("./note");
const AbuseUserReport = _mongodb1.default.get('abuseUserReports');
AbuseUserReport.dropIndex('userId').catch(()=>{});
AbuseUserReport.dropIndex('reporterId').catch(()=>{});
AbuseUserReport.dropIndex([
    'userId',
    'reporterId'
], {
    unique: true
}).catch(()=>{});
const _default = AbuseUserReport;
const packMany = (reports)=>{
    return Promise.all(reports.map((x)=>pack(x)));
};
const pack = async (report)=>{
    let _report;
    if ((0, _isobjectid.default)(report)) {
        _report = await AbuseUserReport.findOne({
            _id: report
        });
    } else if (typeof report === 'string') {
        _report = await AbuseUserReport.findOne({
            _id: new _mongodb.ObjectID(report)
        });
    } else {
        _report = _deepcopy(report);
    }
    // Rename _id to id
    _report.id = _report._id;
    delete _report._id;
    _report.reporter = await (0, _user.pack)(_report.reporterId, null, {
        detail: true
    });
    _report.user = await (0, _user.pack)(_report.userId, null, {
        detail: true
    });
    _report.notes = _report.noteIds ? await (0, _note.packMany)(_report.noteIds, null, {
        skipHide: true
    }) : [];
    return _report;
};

//# sourceMappingURL=abuse-user-report.js.map
