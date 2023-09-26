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
    packPageMany: function() {
        return packPageMany;
    },
    packPage: function() {
        return packPage;
    }
});
const _mongodb = require("mongodb");
const _rap = require("@prezzemolo/rap");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _user = require("./user");
const _drivefile = require("./drive-file");
const _logger = require("../db/logger");
const _pagelike = require("./page-like");
const deepcopy = require('deepcopy');
const Page = _mongodb1.default.get('pages');
Page.createIndex([
    'userId',
    'name'
], {
    unique: true
});
Page.createIndex('name');
const _default = Page;
async function packPageMany(pages, meId) {
    return Promise.all(pages.map((x)=>packPage(x, meId)));
}
async function packPage(src, meId) {
    let populated;
    // Populate the page if 'page' is ID
    if ((0, _isobjectid.default)(src)) {
        populated = await Page.findOne({
            _id: src
        });
    } else if (typeof src === 'string') {
        populated = await Page.findOne({
            _id: new _mongodb.ObjectID(src)
        });
    } else {
        populated = deepcopy(src);
    }
    // (データベースの欠損などで)投稿がデータベース上に見つからなかったとき
    if (populated == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: page :: ${src}`);
        return null;
    }
    const attachedFileIds = [];
    const collectFile = (xs)=>{
        for (const x of xs){
            if (x.type === 'image') {
                attachedFileIds.push(x.fileId);
            }
            if (x.children) {
                collectFile(x.children);
            }
        }
    };
    collectFile(populated.content);
    const result = {
        id: populated._id,
        createdAt: populated.createdAt.toISOString(),
        updatedAt: populated.updatedAt.toISOString(),
        userId: populated.userId,
        user: (0, _user.pack)(populated.userId),
        content: populated.content,
        variables: populated.variables,
        title: populated.title,
        name: populated.name,
        summary: populated.summary,
        hideTitleWhenPinned: populated.hideTitleWhenPinned,
        sensitive: !!populated.sensitive,
        alignCenter: populated.alignCenter,
        font: populated.font,
        eyeCatchingImageId: populated.eyeCatchingImageId,
        eyeCatchingImage: populated.eyeCatchingImageId ? await (0, _drivefile.pack)(populated.eyeCatchingImageId) : null,
        attachedFiles: (0, _drivefile.packMany)(attachedFileIds),
        likedCount: populated.likedCount,
        isLiked: meId && await _pagelike.default.findOne({
            pageId: populated._id,
            userId: meId
        }) != null
    };
    return await (0, _rap.default)(result);
}

//# sourceMappingURL=page.js.map
