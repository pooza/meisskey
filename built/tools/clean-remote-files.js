"use strict";
const _drivefile = require("../models/drive-file");
const _user = require("../models/user");
const _deletefile = require("../services/drive/delete-file");
async function main() {
    const users = await _user.default.find({
        host: {
            $ne: null
        }
    }, {
        fields: {
            _id: true
        }
    });
    let prs = 0;
    for (const u of users){
        prs++;
        const user = await _user.default.findOne({
            _id: u._id
        });
        if (user == null) continue;
        console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);
        const files = await _drivefile.default.find({
            //_id: { $nin: [user.avatarId, user.bannerId] },
            'metadata.userId': user._id,
            'metadata.deletedAt': {
                $exists: false
            },
            'metadata.isRemote': {
                $ne: true
            }
        });
        for (const file of files){
            var _file_metadata;
            console.log(`expire file: ${file._id} ${(_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.url}`);
            await (0, _deletefile.default)(file, true);
        }
    }
}
main().then(()=>{
    console.log('Done');
});

//# sourceMappingURL=clean-remote-files.js.map
