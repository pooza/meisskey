"use strict";
const _user = require("../models/user");
const _drivefile = require("../models/drive-file");
const _deleteunusedfile = require("../services/drive/delete-unused-file");
async function main() {
    // remote users
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
            deletedAt: {
                $exists: false
            },
            'metadata.userId': user._id,
            'metadata.attachedNoteIds.0': {
                $exists: false
            }
        });
        for (const file of files){
            await (0, _deleteunusedfile.deleteUnusedFile)(file._id, true); // TODO: なんか効率悪い
        }
    }
}
main().then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 30 * 1000);
});

//# sourceMappingURL=clean-unused-files.js.map
