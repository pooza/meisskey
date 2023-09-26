"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createImage: function() {
        return createImage;
    },
    resolveImage: function() {
        return resolveImage;
    }
});
const _uploadfromurl = require("../../../services/drive/upload-from-url");
const _drivefile = require("../../../models/drive-file");
const _resolver = require("../resolver");
const _fetchmeta = require("../../../misc/fetch-meta");
const _logger = require("../logger");
const _type = require("../type");
const _fetch = require("../../../misc/fetch");
const logger = _logger.apLogger;
async function createImage(actor, value) {
    var _file_metadata;
    // 投稿者が凍結か削除されていたらスキップ
    if (actor.isSuspended || actor.isDeleted) {
        return null;
    }
    const image = await new _resolver.default().resolve(value);
    if (!(0, _type.isDocument)(image)) return null;
    if (typeof image.url !== 'string') {
        throw new Error('invalid image: url not privided');
    }
    logger.info(`Creating the Image: ${image.url}`);
    const instance = await (0, _fetchmeta.default)();
    const cache = instance.cacheRemoteFiles;
    let file;
    try {
        file = await (0, _uploadfromurl.uploadFromUrl)({
            url: image.url,
            user: actor,
            uri: image.url,
            sensitive: !!image.sensitive,
            isLink: !cache
        });
    } catch (e) {
        // 4xxの場合は添付されてなかったことにする
        if (e instanceof _fetch.StatusError && e.isClientError) {
            logger.warn(`Ignored image: ${image.url} - ${e.statusCode}`);
            return null;
        }
        throw e;
    }
    if ((_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.isRemote) {
        // URLが異なっている場合、同じ画像が以前に異なるURLで登録されていたということなので、
        // URLを更新する
        if (file.metadata.url !== image.url) {
            file = await _drivefile.default.findOneAndUpdate({
                _id: file._id
            }, {
                $set: {
                    'metadata.url': image.url,
                    'metadata.uri': image.url
                }
            }, {
                returnNewDocument: true
            });
        }
    }
    return file;
}
async function resolveImage(actor, value) {
    // TODO
    // リモートサーバーからフェッチしてきて登録
    return await createImage(actor, value);
}

//# sourceMappingURL=image.js.map
