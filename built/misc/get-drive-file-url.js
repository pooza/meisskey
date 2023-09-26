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
    getOriginalUrl: function() {
        return getOriginalUrl;
    }
});
const _config = require("../config");
function _default(file, thumbnail = false) {
    var _file_metadata, _file_metadata1;
    if (file == null) return null;
    const isImage = file.contentType && [
        'image/png',
        'image/apng',
        'image/gif',
        'image/jpeg',
        'image/webp',
        'image/avif',
        'image/svg+xml'
    ].includes(file.contentType);
    if (((_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.withoutChunks) && file.metadata.isRemote && _config.default.proxyRemoteFiles) {
        if (thumbnail) {
            return `${_config.default.driveUrl}/${file._id}/${generateFilename(file, true)}?thumbnail`;
        } else {
            return `${_config.default.driveUrl}/${file._id}/${generateFilename(file)}?web`;
        }
    } else if ((_file_metadata1 = file.metadata) === null || _file_metadata1 === void 0 ? void 0 : _file_metadata1.withoutChunks) {
        if (thumbnail) {
            return file.metadata.thumbnailUrl || file.metadata.webpublicUrl || (isImage ? file.metadata.url : null);
        } else {
            return file.metadata.webpublicUrl || file.metadata.url;
        }
    } else {
        if (thumbnail) {
            return `${_config.default.driveUrl}/${file._id}/${generateFilename(file, true)}?thumbnail`;
        } else {
            return `${_config.default.driveUrl}/${file._id}/${generateFilename(file)}?web`;
        }
    }
}
/**
 * 拡張子付きのファイル名を生成する
 */ function generateFilename(file, thumbnail = false) {
    let ext = '';
    if (thumbnail) {
        ext = '.webp';
    } else {
        if (file.filename) {
            [ext] = file.filename.match(/\.(\w+)$/) || [
                ''
            ];
        }
        if (ext === '' && file.contentType) {
            if (file.contentType === 'image/jpeg') ext = '.jpg';
            if (file.contentType === 'image/png') ext = '.png';
            if (file.contentType === 'image/webp') ext = '.webp';
            if (file.contentType === 'image/avif') ext = '.avif';
        }
    }
    return `${file._id}${ext}`;
}
function getOriginalUrl(file) {
    if (file.metadata && file.metadata.url) {
        return file.metadata.url;
    }
    const accessKey = file.metadata ? file.metadata.accessKey : null;
    return `${_config.default.driveUrl}/${file._id}${accessKey ? '?original=' + accessKey : ''}`;
}

//# sourceMappingURL=get-drive-file-url.js.map
