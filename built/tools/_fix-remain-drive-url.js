"use strict";
const _promiselimit = require("promise-limit");
const _drivefile = require("../models/drive-file");
const limit = _promiselimit(1);
_drivefile.default.find({
    // 期限切れ削除リモートファイル
    'metadata._user.host': {
        $ne: null
    },
    'metadata.deletedAt': {
        $ne: null
    },
    'metadata.isExpired': true
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
    console.log(`uri: ${file.metadata.uri}`);
    console.log(`url: ${file.metadata.url}`);
    if (file.metadata.uri != null) {
        await _drivefile.default.update({
            _id: file._id
        }, {
            $set: {
                'metadata.url': file.metadata.uri
            }
        });
        console.log('done', file._id);
    }
}

//# sourceMappingURL=_fix-remain-drive-url.js.map
