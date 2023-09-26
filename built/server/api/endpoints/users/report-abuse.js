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
const _user = require("../../../../models/user");
const _abuseuserreport = require("../../../../models/abuse-user-report");
const _stream = require("../../../../services/stream");
const _error = require("../../error");
const _getters = require("../../common/getters");
const meta = {
    desc: {
        'ja-JP': '指定したユーザーを迷惑なユーザーであると報告します。'
    },
    tags: [
        'users'
    ],
    requireCredential: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーのID',
                'en-US': 'Target user ID'
            }
        },
        noteIds: {
            validator: _cafy.default.optional.arr(_cafy.default.type(_cafyid.default)).unique().min(0),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象の投稿ID一覧',
                'en-US': 'Target note IDs'
            }
        },
        comment: {
            validator: _cafy.default.str.range(1, 3000),
            desc: {
                'ja-JP': '迷惑行為の詳細'
            }
        }
    },
    errors: {
        noSuchUser: {
            message: 'No such user.',
            code: 'NO_SUCH_USER',
            id: '1acefcb5-0959-43fd-9685-b48305736cb5'
        },
        cannotReportYourself: {
            message: 'Cannot report yourself.',
            code: 'CANNOT_REPORT_YOURSELF',
            id: '1e13149e-b1e8-43cf-902e-c01dbfcb202f'
        },
        cannotReportAdmin: {
            message: 'Cannot report the admin.',
            code: 'CANNOT_REPORT_THE_ADMIN',
            id: '35e166f5-05fb-4f87-a2d5-adb42676d48f'
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    // Lookup user
    const user = await (0, _getters.getUser)(ps.userId).catch((e)=>{
        if (e.id === '15348ddd-432d-49c2-8a5a-8069753becff') throw new _error.ApiError(meta.errors.noSuchUser);
        throw e;
    });
    if (user._id.equals(me._id)) {
        throw new _error.ApiError(meta.errors.cannotReportYourself);
    }
    if (user.isAdmin) {
        throw new _error.ApiError(meta.errors.cannotReportAdmin);
    }
    const report = await _abuseuserreport.default.insert({
        createdAt: new Date(),
        userId: user._id,
        reporterId: me._id,
        noteIds: ps.noteIds,
        comment: ps.comment
    });
    // Publish event to moderators
    setTimeout(async ()=>{
        const moderators = await _user.default.find({
            $or: [
                {
                    isAdmin: true
                },
                {
                    isModerator: true
                }
            ]
        });
        for (const moderator of moderators){
            (0, _stream.publishAdminStream)(moderator._id, 'newAbuseUserReport', {
                id: report._id,
                userId: report.userId,
                reporterId: report.reporterId,
                noteIds: report.noteIds,
                comment: report.comment
            });
        }
    }, 1);
});

//# sourceMappingURL=report-abuse.js.map
