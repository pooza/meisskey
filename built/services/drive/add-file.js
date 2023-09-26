"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    generateAlts: function() {
        return generateAlts;
    },
    storeOriginal: function() {
        return storeOriginal;
    },
    storeAlts: function() {
        return storeAlts;
    },
    addFile: function() {
        return addFile;
    }
});
const _fs = require("fs");
const _drivefile = require("../../models/drive-file");
const _drivefolder = require("../../models/drive-folder");
const _stream = require("../stream");
const _user = require("../../models/user");
const _deletefile = require("./delete-file");
const _drivefilewebpublic = require("../../models/drive-file-webpublic");
const _drivefilethumbnail = require("../../models/drive-file-thumbnail");
const _drive = require("../../services/chart/drive");
const _instance = require("../../services/chart/instance");
const _fetchmeta = require("../../misc/fetch-meta");
const _generatevideothumbnail = require("./generate-video-thumbnail");
const _logger = require("./logger");
const _imageprocessor = require("./image-processor");
const _instance1 = require("../../models/instance");
const _contentdisposition = require("../../misc/content-disposition");
const _getfileinfo = require("../../misc/get-file-info");
const _getdriveconfig = require("../../misc/get-drive-config");
const _s3 = require("./s3");
const _libstorage = require("@aws-sdk/lib-storage");
const _sharp = require("sharp");
const _uuid = require("uuid");
const _internalstorage = require("./internal-storage");
const logger = _logger.driveLogger.createSubLogger('register', 'yellow');
/***
 * Save file
 * @param path Path for original
 * @param name Name for original
 * @param info FileInfo
 * @param metadata
 */ async function save(path, name, info, metadata, drive) {
    // thunbnail, webpublic を必要なら生成
    let animation = info.type.mime === 'image/apng' ? 'yes' : info.type.mime === 'image/png' ? 'no' : undefined;
    const alts = await generateAlts(path, info.type.mime, !metadata.uri).catch((err)=>{
        if (err === 'ANIMATED') {
            animation = 'yes';
        } else {
            logger.error(err);
        }
        return {
            webpublic: null,
            thumbnail: null
        };
    });
    if (info.type.mime === 'image/apng') info.type.mime = 'image/png';
    if (drive.storage == 'minio') {
        //#region ObjectStorage params
        const ext = info.type.ext && _getfileinfo.FILE_TYPE_BROWSERSAFE.includes(info.type.mime) ? `.${info.type.ext}` : '';
        const baseUrl = drive.baseUrl || `${drive.config.useSSL ? 'https' : 'http'}://${drive.config.endPoint}${drive.config.port ? `:${drive.config.port}` : ''}/${drive.bucket}`;
        // for original
        const key = `${drive.prefix}/${(0, _uuid.v4)()}${ext}`;
        const url = `${baseUrl}/${key}`;
        // for alts
        let thumbnailKey = null;
        let thumbnailUrl = null;
        //#endregion
        //#region Uploads
        logger.info(`uploading original: ${key}`);
        const uploads = [];
        if (alts.webpublic) {
            uploads.push(upload(key, alts.webpublic.data, alts.webpublic.type, name, drive));
        } else {
            uploads.push(upload(key, _fs.createReadStream(path), info.type.mime, name, drive));
        }
        if (alts.thumbnail) {
            thumbnailKey = `${drive.prefix}/${(0, _uuid.v4)()}.${alts.thumbnail.ext}`;
            thumbnailUrl = `${baseUrl}/${thumbnailKey}`;
            logger.info(`uploading thumbnail: ${thumbnailKey}`);
            uploads.push(upload(thumbnailKey, alts.thumbnail.data, alts.thumbnail.type, null, drive));
        }
        await Promise.all(uploads);
        //#endregion
        //#region DB
        Object.assign(metadata, {
            withoutChunks: true,
            storage: 'minio',
            storageProps: {
                key,
                webpublicKey: undefined,
                thumbnailKey
            },
            url,
            webpublicUrl: undefined,
            thumbnailUrl
        });
        const file = await _drivefile.default.insert({
            length: info.size,
            uploadDate: new Date(),
            md5: info.md5,
            filename: name,
            metadata: metadata,
            contentType: info.type.mime,
            animation
        });
        //#endregion
        return file;
    } else if (drive.storage == 'fs') {
        const key = `${(0, _uuid.v4)()}`;
        let thumbnailKey = null;
        if (alts.webpublic) {
            await _internalstorage.InternalStorage.saveFromBufferAsync(key, alts.webpublic.data);
        } else {
            await _internalstorage.InternalStorage.saveFromPathAsync(key, path);
        }
        if (alts.thumbnail) {
            thumbnailKey = `${(0, _uuid.v4)()}`;
            await _internalstorage.InternalStorage.saveFromBufferAsync(thumbnailKey, alts.thumbnail.data);
        }
        //#region DB
        Object.assign(metadata, {
            withoutChunks: false,
            storage: 'fs',
            storageProps: {
                key,
                webpublicKey: undefined,
                thumbnailKey
            },
            fileSystem: true
        });
        const file = await _drivefile.default.insert({
            length: info.size,
            uploadDate: new Date(),
            md5: info.md5,
            filename: name,
            metadata: metadata,
            contentType: info.type.mime,
            animation
        });
        //#endregion
        return file;
    } else {
        // TODO: オリジナルを保存しない
        // #region store original
        const originalDst = await (0, _drivefile.getDriveFileBucket)();
        // web用(Exif削除済み)がある場合はオリジナルにアクセス制限
        if (alts.webpublic) metadata.accessKey = (0, _uuid.v4)();
        const originalFile = await storeOriginal(originalDst, name, path, info.type.mime, metadata);
        logger.info(`original stored to ${originalFile._id}`);
        // #endregion store original
        // #region store webpublic
        if (alts.webpublic) {
            const webDst = await (0, _drivefilewebpublic.getDriveFileWebpublicBucket)();
            const webFile = await storeAlts(webDst, name, alts.webpublic.data, alts.webpublic.type, originalFile._id);
            logger.info(`web stored ${webFile._id}`);
        }
        // #endregion store webpublic
        if (alts.thumbnail) {
            const thumDst = await (0, _drivefilethumbnail.getDriveFileThumbnailBucket)();
            const thumFile = await storeAlts(thumDst, name, alts.thumbnail.data, alts.thumbnail.type, originalFile._id);
            logger.info(`web stored ${thumFile._id}`);
        }
        return originalFile;
    }
}
async function generateAlts(path, type, generateWeb) {
    // video
    if (type.startsWith('video/')) {
        const thumbnail = await (0, _generatevideothumbnail.generateVideoThumbnail)(path);
        return {
            webpublic: null,
            thumbnail
        };
    }
    // unsupported image
    if (![
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/svg+xml'
    ].includes(type)) {
        return {
            webpublic: null,
            thumbnail: null
        };
    }
    const img = _sharp(path);
    const metadata = await img.metadata();
    const isAnimated = metadata.pages && metadata.pages > 1;
    // skip animated
    if (isAnimated) {
        throw 'ANIMATED';
    }
    // #region webpublic
    let webpublic = null;
    const webpulicSafe = !metadata.exif && !metadata.iptc && !metadata.xmp && !metadata.tifftagPhotoshop // has meta
     && metadata.width && metadata.width <= 2048 && metadata.height && metadata.height <= 2048; // or over 2048
    if (generateWeb) {
        logger.debug(`creating web image`);
        if ([
            'image/jpeg'
        ].includes(type) && !webpulicSafe) {
            webpublic = await (0, _imageprocessor.convertSharpToJpeg)(img, 2048, 2048);
        } else if ([
            'image/webp'
        ].includes(type) && !webpulicSafe) {
            webpublic = await (0, _imageprocessor.convertSharpToWebp)(img, 2048, 2048);
        } else if ([
            'image/avif'
        ].includes(type) && !webpulicSafe) {
            webpublic = await (0, _imageprocessor.convertSharpToAvif)(img, 2048, 2048);
        } else if ([
            'image/png'
        ].includes(type) && !webpulicSafe) {
            webpublic = await (0, _imageprocessor.convertSharpToPng)(img, 2048, 2048);
        } else if ([
            'image/svg+xml'
        ].includes(type)) {
            webpublic = await (0, _imageprocessor.convertSharpToPng)(img, 2048, 2048);
        } else {
            logger.debug(`web image not created (not an image)`);
        }
    } else {
        logger.debug(`web image not created (from remote or resized)`);
    }
    // #endregion webpublic
    // #region thumbnail
    let thumbnail = null;
    if ([
        'image/jpeg',
        'image/webp',
        'image/avif'
    ].includes(type)) {
        thumbnail = await (0, _imageprocessor.convertSharpToJpeg)(img, 530, 255);
    } else if ([
        'image/png',
        'image/svg+xml'
    ].includes(type)) {
        thumbnail = await (0, _imageprocessor.convertSharpToPngOrJpeg)(img, 530, 255);
    }
    // #endregion thumbnail
    return {
        webpublic,
        thumbnail
    };
}
/**
 * Upload to ObjectStorage
 */ async function upload(key, stream, type, filename, drive) {
    var _drive_config, _drive_config1;
    if (!_getfileinfo.FILE_TYPE_BROWSERSAFE.includes(type)) type = 'application/octet-stream';
    const params = {
        Bucket: drive.bucket,
        Key: key,
        Body: stream,
        ContentType: type,
        CacheControl: 'max-age=2592000, s-maxage=172800, immutable'
    };
    if (filename) params.ContentDisposition = (0, _contentdisposition.contentDisposition)('inline', filename);
    if ((_drive_config = drive.config) === null || _drive_config === void 0 ? void 0 : _drive_config.setPublicRead) params.ACL = 'public-read';
    const s3Client = (0, _s3.getS3Client)(drive);
    const upload = new _libstorage.Upload({
        client: s3Client,
        params,
        partSize: ((_drive_config1 = drive.config) === null || _drive_config1 === void 0 ? void 0 : _drive_config1.endPoint) === 'storage.googleapis.com' ? 500 * 1024 * 1024 : 8 * 1024 * 1024
    });
    const result = await upload.done(); // TODO: About...が返ることがあるのか、abortはどう判定するのか謎
    logger.debug(`Uploaded: ${result.Bucket}/${result.Key} => ${result.Location}`);
}
async function storeOriginal(bucket, name, path, contentType, metadata) {
    return new Promise((resolve, reject)=>{
        const writeStream = bucket.openUploadStream(name, {
            contentType,
            metadata
        });
        writeStream.once('finish', resolve);
        writeStream.on('error', reject);
        _fs.createReadStream(path).pipe(writeStream);
    });
}
async function storeAlts(bucket, name, data, contentType, originalId) {
    return new Promise((resolve, reject)=>{
        const writeStream = bucket.openUploadStream(name, {
            contentType,
            metadata: {
                originalId
            }
        });
        writeStream.once('finish', resolve);
        writeStream.on('error', reject);
        writeStream.end(data);
    });
}
async function deleteOldFile(user) {
    const oldFile = await _drivefile.default.findOne({
        _id: {
            $nin: [
                user.avatarId,
                user.bannerId
            ]
        },
        'metadata.userId': user._id,
        'metadata.deletedAt': {
            $exists: false
        }
    }, {
        sort: {
            _id: 1
        }
    });
    if (oldFile) {
        (0, _deletefile.default)(oldFile, true);
    }
}
async function addFile({ user, path, name = null, comment = null, folderId = null, force = false, isLink = false, url = null, uri = null, sensitive = false }) {
    var _user_settings, _driveFile_metadata, _driveFile, _driveFile_metadata1;
    const info = await (0, _getfileinfo.getFileInfo)(path);
    logger.info(`${JSON.stringify(info)}`);
    // detect name
    const detectedName = name || (info.type.ext ? `untitled.${info.type.ext}` : 'untitled');
    if (!force) {
        // Check if there is a file with the same hash
        const much = await _drivefile.default.findOne({
            md5: info.md5,
            'metadata.userId': user._id,
            'metadata.deletedAt': {
                $exists: false
            }
        });
        if (much) {
            var _much_metadata;
            logger.info(`file with same hash is found: ${much._id}`);
            // ファイルに後からsensitiveが付けられたらフラグを上書き
            if (sensitive && !((_much_metadata = much.metadata) === null || _much_metadata === void 0 ? void 0 : _much_metadata.isSensitive)) {
                await _drivefile.default.update({
                    _id: much._id
                }, {
                    $set: {
                        'metadata.isSensitive': sensitive
                    }
                });
                return await _drivefile.default.findOne({
                    _id: much._id
                });
            } else {
                return much;
            }
        }
    }
    //#region リモートファイルを保存する場合は容量チェック
    if ((0, _user.isRemoteUser)(user) && !isLink) {
        const usage = await _drivefile.default.aggregate([
            {
                $match: {
                    'metadata.userId': user._id,
                    'metadata.deletedAt': {
                        $exists: false
                    }
                }
            },
            {
                $project: {
                    length: true
                }
            },
            {
                $group: {
                    _id: null,
                    usage: {
                        $sum: '$length'
                    }
                }
            }
        ]).then((aggregates)=>{
            if (aggregates.length > 0) {
                return aggregates[0].usage;
            }
            return 0;
        });
        logger.debug(`drive usage is ${usage}`);
        const instance = await (0, _fetchmeta.default)();
        const driveCapacity = 1024 * 1024 * (instance.remoteDriveCapacityMb || 0);
        // If usage limit exceeded
        if (usage + info.size > driveCapacity) {
            // (アバターまたはバナーを含まず)最も古いファイルを削除する
            deleteOldFile(user);
        }
    }
    //#endregion
    const fetchFolder = async ()=>{
        if (!folderId) {
            return null;
        }
        const driveFolder = await _drivefolder.default.findOne({
            _id: folderId,
            userId: user._id
        });
        if (driveFolder == null) throw 'folder-not-found';
        return driveFolder;
    };
    const properties = {};
    if (info.width) {
        properties['width'] = info.width;
        properties['height'] = info.height;
    }
    const folder = await fetchFolder();
    const metadata = {
        userId: user._id,
        _user: {
            host: user.host
        },
        folderId: folder !== null ? folder._id : null,
        comment: comment,
        properties: properties,
        withoutChunks: isLink,
        isRemote: isLink,
        isSensitive: (0, _user.isLocalUser)(user) && ((_user_settings = user.settings) === null || _user_settings === void 0 ? void 0 : _user_settings.alwaysMarkNsfw) || sensitive
    };
    if (url !== null) {
        metadata.src = url;
        if (isLink) {
            metadata.url = url;
        }
    }
    if (uri !== null) {
        metadata.uri = uri;
    }
    let driveFile;
    if (isLink) {
        try {
            driveFile = await _drivefile.default.insert({
                length: 0,
                uploadDate: new Date(),
                md5: info.md5,
                filename: detectedName,
                metadata: metadata,
                contentType: info.type.mime
            });
        } catch (e) {
            // duplicate key error (when already registered)
            if (e.code === 11000) {
                logger.info(`already registered ${metadata.uri}`);
                driveFile = await _drivefile.default.findOne({
                    'metadata.uri': metadata.uri,
                    'metadata.userId': user._id
                });
            } else {
                logger.error(e);
                throw e;
            }
        }
    } else {
        const drive = (0, _getdriveconfig.getDriveConfig)(uri != null);
        driveFile = await save(path, detectedName, info, metadata, drive);
    }
    if (!driveFile) throw 'Failed to create drivefile ${e}';
    logger.succ(`drive file has been created ${driveFile._id}`);
    if ((0, _user.isLocalUser)((_driveFile_metadata = (_driveFile = driveFile) === null || _driveFile === void 0 ? void 0 : _driveFile.metadata) === null || _driveFile_metadata === void 0 ? void 0 : _driveFile_metadata._user)) {
        (0, _drivefile.pack)(driveFile, {
            self: true
        }).then((packedFile)=>{
            // Publish driveFileCreated event
            (0, _stream.publishMainStream)(user._id, 'driveFileCreated', packedFile);
            (0, _stream.publishDriveStream)(user._id, 'fileCreated', packedFile);
        });
    }
    // 統計を更新
    _drive.default.update(driveFile, true); // TODO
    if ((0, _user.isRemoteUser)((_driveFile_metadata1 = driveFile.metadata) === null || _driveFile_metadata1 === void 0 ? void 0 : _driveFile_metadata1._user)) {
        _instance.default.updateDrive(driveFile, true);
        _instance1.default.update({
            host: driveFile.metadata._user.host
        }, {
            $inc: {
                driveUsage: driveFile.length,
                driveFiles: 1
            }
        });
    }
    return driveFile;
}

//# sourceMappingURL=add-file.js.map
