"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _drivefile = require("../../models/drive-file");
const _drivefilethumbnail = require("../../models/drive-file-thumbnail");
const _drive = require("../../services/chart/drive");
const _instance = require("../../services/chart/instance");
const _drivefilewebpublic = require("../../models/drive-file-webpublic");
const _instance1 = require("../../models/instance");
const _user = require("../../models/user");
const _getdriveconfig = require("../../misc/get-drive-config");
const _s3 = require("./s3");
const _clients3 = require("@aws-sdk/client-s3");
const _internalstorage = require("./internal-storage");
async function _default(file, isExpired = false) {
    var _file_metadata, _file_metadata1;
    if (((_file_metadata = file.metadata) === null || _file_metadata === void 0 ? void 0 : _file_metadata.storage) == 'minio') {
        const drive = (0, _getdriveconfig.getDriveConfig)(file.metadata.uri != null);
        if (file.metadata.storageProps == null) {
            throw 'file.metadata.storageProps is null';
        }
        if (drive.bucket == null) {
            throw 'drive.bucket is null';
        }
        const s3Client = (0, _s3.getS3Client)(drive);
        // 後方互換性のため、file.metadata.storageProps.key があるかどうかチェックしています。
        // 将来的には const obj = file.metadata.storageProps.key; とします。
        const obj = file.metadata.storageProps.key ? file.metadata.storageProps.key : `${drive.prefix}/${file.metadata.storageProps.id}`;
        await s3Client.send(new _clients3.DeleteObjectCommand({
            Bucket: drive.bucket,
            Key: obj
        }));
        if (file.metadata.thumbnailUrl) {
            // 後方互換性のため、file.metadata.storageProps.thumbnailKey があるかどうかチェックしています。
            // 将来的には const thumbnailObj = file.metadata.storageProps.thumbnailKey; とします。
            const thumbnailObj = file.metadata.storageProps.thumbnailKey ? file.metadata.storageProps.thumbnailKey : `${drive.prefix}/${file.metadata.storageProps.id}-thumbnail`;
            await s3Client.send(new _clients3.DeleteObjectCommand({
                Bucket: drive.bucket,
                Key: thumbnailObj
            }));
        }
        if (file.metadata.webpublicUrl) {
            const webpublicObj = file.metadata.storageProps.webpublicKey ? file.metadata.storageProps.webpublicKey : `${drive.prefix}/${file.metadata.storageProps.id}-original`;
            await s3Client.send(new _clients3.DeleteObjectCommand({
                Bucket: drive.bucket,
                Key: webpublicObj
            }));
        }
    }
    // チャンクをすべて削除
    await _drivefile.DriveFileChunk.remove({
        files_id: file._id
    });
    // fs削除
    if ((_file_metadata1 = file.metadata) === null || _file_metadata1 === void 0 ? void 0 : _file_metadata1.fileSystem) {
        var _file_metadata_storageProps, _file_metadata2, _file_metadata_storageProps1, _file_metadata3, _file_metadata_storageProps2, _file_metadata4, _file_metadata_storageProps3, _file_metadata5, _file_metadata_storageProps4, _file_metadata6, _file_metadata_storageProps5, _file_metadata7;
        if ((_file_metadata_storageProps = (_file_metadata2 = file.metadata) === null || _file_metadata2 === void 0 ? void 0 : _file_metadata2.storageProps) === null || _file_metadata_storageProps === void 0 ? void 0 : _file_metadata_storageProps.key) _internalstorage.InternalStorage.del((_file_metadata_storageProps1 = (_file_metadata3 = file.metadata) === null || _file_metadata3 === void 0 ? void 0 : _file_metadata3.storageProps) === null || _file_metadata_storageProps1 === void 0 ? void 0 : _file_metadata_storageProps1.key);
        if ((_file_metadata_storageProps2 = (_file_metadata4 = file.metadata) === null || _file_metadata4 === void 0 ? void 0 : _file_metadata4.storageProps) === null || _file_metadata_storageProps2 === void 0 ? void 0 : _file_metadata_storageProps2.thumbnailKey) _internalstorage.InternalStorage.del((_file_metadata_storageProps3 = (_file_metadata5 = file.metadata) === null || _file_metadata5 === void 0 ? void 0 : _file_metadata5.storageProps) === null || _file_metadata_storageProps3 === void 0 ? void 0 : _file_metadata_storageProps3.thumbnailKey);
        if ((_file_metadata_storageProps4 = (_file_metadata6 = file.metadata) === null || _file_metadata6 === void 0 ? void 0 : _file_metadata6.storageProps) === null || _file_metadata_storageProps4 === void 0 ? void 0 : _file_metadata_storageProps4.webpublicKey) _internalstorage.InternalStorage.del((_file_metadata_storageProps5 = (_file_metadata7 = file.metadata) === null || _file_metadata7 === void 0 ? void 0 : _file_metadata7.storageProps) === null || _file_metadata_storageProps5 === void 0 ? void 0 : _file_metadata_storageProps5.webpublicKey);
    }
    const set = {
        'metadata.deletedAt': new Date(),
        'metadata.isExpired': isExpired
    };
    // リモートファイル期限切れ削除後は直リンクにする
    if (isExpired && file.metadata && file.metadata._user && file.metadata._user.host != null) {
        set['metadata.withoutChunks'] = true;
        set['metadata.isRemote'] = true;
        set['metadata.url'] = file.metadata.uri;
        set['metadata.thumbnailUrl'] = undefined;
        set['metadata.webpublicUrl'] = undefined;
    }
    await _drivefile.default.update({
        _id: file._id
    }, {
        $set: set
    });
    //#region サムネイルもあれば削除
    const thumbnail = await _drivefilethumbnail.default.findOne({
        'metadata.originalId': file._id
    });
    if (thumbnail) {
        await _drivefilethumbnail.DriveFileThumbnailChunk.remove({
            files_id: thumbnail._id
        });
        await _drivefilethumbnail.default.remove({
            _id: thumbnail._id
        });
    }
    //#endregion
    //#region Web公開用もあれば削除
    const webpublic = await _drivefilewebpublic.default.findOne({
        'metadata.originalId': file._id
    });
    if (webpublic) {
        await _drivefilewebpublic.DriveFileWebpublicChunk.remove({
            files_id: webpublic._id
        });
        await _drivefilewebpublic.default.remove({
            _id: webpublic._id
        });
    }
    //#endregion
    // 統計を更新
    _drive.default.update(file, false);
    if (file.metadata && (0, _user.isRemoteUser)(file.metadata._user)) {
        _instance.default.updateDrive(file, false);
        _instance1.default.update({
            host: file.metadata._user.host
        }, {
            $inc: {
                driveUsage: -file.length,
                driveFiles: -1
            }
        });
    }
}

//# sourceMappingURL=delete-file.js.map
