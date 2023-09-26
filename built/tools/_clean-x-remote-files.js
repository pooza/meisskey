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
        console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);
        const files = await _drivefile.default.find({
            _id: {
                $nin: [
                    user.avatarId,
                    user.bannerId
                ]
            },
            'metadata.userId': user._id
        });
        for (const file of files){
            if (file.metadata.url && file.metadata.url.match('PATTERN HERE')) {
                console.log(`delete file: ${file._id} ${file.metadata.url}`);
                await (0, _deletefile.default)(file, true);
            } else {
                console.log(`unmatch file: ${file._id} ${file.metadata.url}`);
            }
        }
    }
}
main().then(()=>{
    console.log('Done');
});

//# sourceMappingURL=_clean-x-remote-files.js.map
