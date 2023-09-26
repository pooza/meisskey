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
const _getters = require("../../common/getters");
const _person = require("../../../../remote/activitypub/models/person");
const meta = {
    desc: {
        'ja-JP': '指定されたリモートユーザーの情報を更新します。',
        'en-US': 'Update specified remote user information.'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireModerator: true,
    params: {
        userId: {
            validator: _cafy.default.type(_cafyid.default),
            transform: _cafyid.transform,
            desc: {
                'ja-JP': '対象のユーザーID',
                'en-US': 'The user ID which you want to update'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    await updatePersonById(ps.userId);
    return;
});
async function updatePersonById(userId) {
    const user = await (0, _getters.getRemoteUser)(userId);
    await (0, _person.updatePerson)(user.uri);
}

//# sourceMappingURL=update-remote-user.js.map
