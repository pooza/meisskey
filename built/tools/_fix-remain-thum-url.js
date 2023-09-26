"use strict";
const _promiselimit = require("promise-limit");
const _drivefile = require("../models/drive-file");
const limit = _promiselimit(1);
_drivefile.default.find({
    'metadata._user.host': null,
    'metadata.thumbnailUrl': {
        $regex: /drive\.misskey/
    }
}, {
    fields: {
        _id: true
    }
}).then(async (files)=>{
    console.log(`there is ${files.length} files`);
    await Promise.all(files.map((file)=>limit(()=>job(file))));
    console.log('ALL DONE');
});
async function job(file) {
    file = await _drivefile.default.findOne({
        _id: file._id
    });
    console.log(`old thumbnailUrl: ${file.metadata.thumbnailUrl}`);
    if (file.metadata.thumbnailUrl != null) {
        if (file.metadata.thumbnailUrl.match('https://drive.misskey.m544.net/')) {
            const newUrl = file.metadata.thumbnailUrl.replace('https://drive.misskey.m544.net/', 'https://misskey-drive.m544.net/');
            console.log(`new thumbnailUrl: ${newUrl}`);
            const res = await _drivefile.default.update({
                _id: file._id
            }, {
                $set: {
                    'metadata.thumbnailUrl': newUrl
                }
            });
            console.log(res);
        }
        console.log('done', file._id);
    }
}

//# sourceMappingURL=_fix-remain-thum-url.js.map
