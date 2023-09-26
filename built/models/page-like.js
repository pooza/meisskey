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
    packPageLikeMany: function() {
        return packPageLikeMany;
    },
    packPageLike: function() {
        return packPageLike;
    }
});
const _mongodb = require("mongodb");
const _mongodb1 = require("../db/mongodb");
const _isobjectid = require("../misc/is-objectid");
const _logger = require("../db/logger");
const _page = require("./page");
const deepcopy = require('deepcopy');
const PageLike = _mongodb1.default.get('pageLikes');
PageLike.createIndex([
    'userId',
    'pageId'
], {
    unique: true
});
PageLike.createIndex('pageId');
const _default = PageLike;
async function packPageLikeMany(likes, meId) {
    return Promise.all(likes.map((x)=>packPageLike(x, meId)));
}
async function packPageLike(src, meId) {
    let populated;
    // Populate
    if ((0, _isobjectid.default)(src)) {
        populated = await PageLike.findOne({
            _id: src
        });
    } else if (typeof src === 'string') {
        populated = await PageLike.findOne({
            _id: new _mongodb.ObjectID(src)
        });
    } else {
        populated = deepcopy(src);
    }
    // (データベースの欠損などで)投稿がデータベース上に見つからなかったとき
    if (populated == null) {
        _logger.dbLogger.warn(`[DAMAGED DB] (missing) pkg: pageLike :: ${src}`);
        return null;
    }
    return {
        id: populated._id,
        page: await (0, _page.packPage)(populated.pageId, meId)
    };
}

//# sourceMappingURL=page-like.js.map
