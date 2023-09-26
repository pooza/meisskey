"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _tmp = require("tmp");
const _fs = require("fs");
const _rename = require("rename");
const _drivefile = require("../../models/drive-file");
const _drivefilethumbnail = require("../../models/drive-file-thumbnail");
const _drivefilewebpublic = require("../../models/drive-file-webpublic");
const _ = require("..");
const _imageprocessor = require("../../services/drive/image-processor");
const _generatevideothumbnail = require("../../services/drive/generate-video-thumbnail");
const _contentdisposition = require("../../misc/content-disposition");
const _getfileinfo = require("../../misc/get-file-info");
const _downloadurl = require("../../misc/download-url");
const _internalstorage = require("../../services/drive/internal-storage");
const _fetch = require("../../misc/fetch");
const commonReadableHandlerGenerator = (ctx)=>(e)=>{
        _.serverLogger.error(e);
        ctx.status = 500;
        ctx.set('Cache-Control', 'max-age=300');
    };
async function _default(ctx) {
    var _file_metadata, _file_metadata1, _file_metadata2, _file_metadata3;
    //#region Validate id
    if (!_mongodb.ObjectID.isValid(ctx.params.id)) {
        return await sendError(ctx, 404);
    }
    //#endregion
    //#region Fetch driveFile
    const fileId = new _mongodb.ObjectID(ctx.params.id);
    const file = await _drivefile.default.findOne({
        _id: fileId
    });
    if (file == null) {
        return await sendError(ctx, 404);
    }
    //#endregion
    //#region 未保存/期限切れリモートファイル
    if (((_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.withoutChunks) && (file.metadata.isRemote || file.metadata._user.host != null)) {
        // urlは過去のバグで張り替え忘れている可能性があるためuriを優先する
        const url = file.metadata.uri || file.metadata.url;
        if (url == null) {
            return await sendError(ctx, 404);
        }
        // Create temp file
        const [path, cleanup] = await new Promise((res, rej)=>{
            _tmp.file((e, path, fd, cleanup)=>{
                if (e) return rej(e);
                res([
                    path,
                    cleanup
                ]);
            });
        });
        try {
            await (0, _downloadurl.downloadUrl)(url, path);
            const { mime, ext } = await (0, _getfileinfo.detectTypeWithCheck)(path);
            const convertFile = async ()=>{
                if ('thumbnail' in ctx.query) {
                    if ([
                        'image/jpeg',
                        'image/webp',
                        'image/avif'
                    ].includes(mime)) {
                        return await (0, _imageprocessor.convertToJpeg)(path, 530, 255);
                    } else if ([
                        'image/png',
                        'image/svg+xml'
                    ].includes(mime)) {
                        return await (0, _imageprocessor.convertToPngOrJpeg)(path, 530, 255);
                    } else if (mime.startsWith('video/')) {
                        return await (0, _generatevideothumbnail.generateVideoThumbnail)(path);
                    }
                }
                return {
                    data: await _fs.promises.readFile(path),
                    ext,
                    type: mime
                };
            };
            const file = await convertFile();
            return await sendNormal(ctx, file.data, file.type);
        } catch (e) {
            _.serverLogger.error(e);
            return await sendError(ctx, e instanceof _fetch.StatusError && e.isClientError ? e.statusCode : 500);
        } finally{
            cleanup();
        }
    }
    //#endregion 未保存/期限切れリモートファイル
    // 削除済み
    if ((_file_metadata1 = file.metadata) === null || _file_metadata1 === void 0 ? void 0 : _file_metadata1.deletedAt) {
        return await sendError(ctx, 410);
    }
    // ローカル保存じゃないのにここに来た
    if ((_file_metadata2 = file.metadata) === null || _file_metadata2 === void 0 ? void 0 : _file_metadata2.withoutChunks) {
        return await sendError(ctx, 404);
    }
    //#region ファイルシステム格納
    if ((_file_metadata3 = file.metadata) === null || _file_metadata3 === void 0 ? void 0 : _file_metadata3.fileSystem) {
        const isThumbnail = 'thumbnail' in ctx.query;
        const isWebpublic = 'web' in ctx.query;
        if (isThumbnail || isWebpublic) {
            var _file_metadata_storageProps, _file_metadata_storageProps1, _file_metadata_storageProps2, _file_metadata_storageProps3;
            const key = isThumbnail ? ((_file_metadata_storageProps = file.metadata.storageProps) === null || _file_metadata_storageProps === void 0 ? void 0 : _file_metadata_storageProps.thumbnailKey) || ((_file_metadata_storageProps1 = file.metadata.storageProps) === null || _file_metadata_storageProps1 === void 0 ? void 0 : _file_metadata_storageProps1.key) : ((_file_metadata_storageProps2 = file.metadata.storageProps) === null || _file_metadata_storageProps2 === void 0 ? void 0 : _file_metadata_storageProps2.webpublicKey) || ((_file_metadata_storageProps3 = file.metadata.storageProps) === null || _file_metadata_storageProps3 === void 0 ? void 0 : _file_metadata_storageProps3.key);
            if (!key) throw 'fs but key not found';
            const { mime, ext } = await (0, _getfileinfo.detectTypeWithCheck)(_internalstorage.InternalStorage.resolvePath(key));
            const filename = _rename(file.filename, {
                suffix: isThumbnail ? '-thumb' : '-web',
                extname: ext ? `.${ext}` : undefined
            }).toString();
            return await sendNormal(ctx, _internalstorage.InternalStorage.read(key), mime, filename);
        } else {
            var _file_metadata_storageProps4;
            // オリジナルはキーチェック
            if (file.metadata && file.metadata.accessKey && file.metadata.accessKey != ctx.query['original']) {
                return await sendError(ctx, 403);
            }
            const key = (_file_metadata_storageProps4 = file.metadata.storageProps) === null || _file_metadata_storageProps4 === void 0 ? void 0 : _file_metadata_storageProps4.key;
            if (!key) throw 'fs but key not found';
            const readable = _internalstorage.InternalStorage.read(key);
            readable.on('error', commonReadableHandlerGenerator(ctx));
            return await sendNormal(ctx, readable, file.contentType, file.filename);
        }
    }
    //#endregion ファイルシステム格納
    //#region DB格納
    if ('thumbnail' in ctx.query) {
        const thumb = await _drivefilethumbnail.default.findOne({
            'metadata.originalId': file._id
        });
        if (thumb != null) {
            const bucket = await (0, _drivefilethumbnail.getDriveFileThumbnailBucket)();
            return await sendNormal(ctx, bucket.openDownloadStream(thumb._id), thumb.contentType || 'image/jpeg', `${_rename(file.filename, {
                suffix: '-thumb',
                extname: '.jpg'
            })}`);
        } else {
            if (file.contentType.startsWith('image/')) {
                return await sendRaw(ctx, file);
            } else {
                return await sendError(ctx, 404);
            }
        }
    } else if ('web' in ctx.query) {
        const web = await _drivefilewebpublic.default.findOne({
            'metadata.originalId': file._id
        });
        if (web != null) {
            const bucket = await (0, _drivefilewebpublic.getDriveFileWebpublicBucket)();
            return await sendNormal(ctx, bucket.openDownloadStream(web._id), web.contentType || file.contentType, `${_rename(file.filename, {
                suffix: '-web'
            })}`);
        } else {
            return await sendRaw(ctx, file);
        }
    } else {
        return await sendRaw(ctx, file);
    }
}
async function sendRaw(ctx, file) {
    if (file.metadata && file.metadata.accessKey && file.metadata.accessKey != ctx.query['original']) {
        return await sendError(ctx, 403);
    }
    const bucket = await (0, _drivefile.getDriveFileBucket)();
    const readable = bucket.openDownloadStream(file._id);
    readable.on('error', commonReadableHandlerGenerator(ctx));
    return await sendNormal(ctx, readable, file.contentType, file.filename);
}
async function sendNormal(ctx, body, contentType, filename) {
    ctx.body = body;
    ctx.set('Content-Type', _getfileinfo.FILE_TYPE_BROWSERSAFE.includes(contentType) ? contentType : 'application/octet-stream');
    ctx.set('Cache-Control', 'max-age=2592000, s-maxage=172800, immutable');
    if (filename) ctx.set('Content-Disposition', (0, _contentdisposition.contentDisposition)('inline', filename));
}
async function sendError(ctx, status) {
    ctx.status = status;
    ctx.set('Cache-Control', 'max-age=3600');
}

//# sourceMappingURL=send-drive-file.js.map
