"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    FILE_TYPE_BROWSERSAFE: function() {
        return FILE_TYPE_BROWSERSAFE;
    },
    getFileInfo: function() {
        return getFileInfo;
    },
    detectTypeWithCheck: function() {
        return detectTypeWithCheck;
    },
    getFileSize: function() {
        return getFileSize;
    },
    calcHash: function() {
        return calcHash;
    },
    detectImageSize: function() {
        return detectImageSize;
    },
    getVideoProps: function() {
        return getVideoProps;
    }
});
const _fs = require("fs");
const _crypto = require("crypto");
const _stream = require("stream");
const _util = require("util");
const _filetype = require("file-type");
const _probeimagesize = require("probe-image-size");
const _fluentffmpeg = require("fluent-ffmpeg");
// 認識対象フィルタ
const FILE_TYPE_DETECTS = [
    // Images
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/apng',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
    'image/svg+xml',
    // OggS
    'audio/opus',
    'video/ogg',
    'audio/ogg',
    'application/ogg',
    // ISO/IEC base media file format
    'video/quicktime',
    'video/mp4',
    'audio/mp4',
    'video/x-m4v',
    'audio/x-m4a',
    'video/3gpp',
    'video/3gpp2',
    'video/mpeg',
    'audio/mpeg',
    'video/webm',
    'audio/webm',
    'audio/aac',
    'audio/x-flac',
    'audio/vnd.wave'
];
const FILE_TYPE_BROWSERSAFE = [
    // Images
    'image/png',
    'image/gif',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/apng',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
    // no SVG
    // OggS
    'audio/opus',
    'video/ogg',
    'audio/ogg',
    'application/ogg',
    // ISO/IEC base media file format
    'video/quicktime',
    'video/mp4',
    'audio/mp4',
    'video/x-m4v',
    'audio/x-m4a',
    'video/3gpp',
    'video/3gpp2',
    'video/mpeg',
    'audio/mpeg',
    'video/webm',
    'audio/webm',
    'audio/aac',
    'audio/x-flac',
    'audio/vnd.wave'
];
const pipeline = _util.promisify(_stream.pipeline);
const TYPE_OCTET_STREAM = {
    mime: 'application/octet-stream',
    ext: null
};
const TYPE_MP4 = {
    mime: 'video/mp4',
    ext: 'mp4'
};
const TYPE_MP4_AS_AUDIO = {
    mime: 'audio/mp4',
    ext: 'mp4'
};
async function getFileInfo(path) {
    const size = await getFileSize(path);
    const md5 = await calcHash(path);
    const r = await detectTypeWithCheck(path);
    return {
        size,
        md5,
        type: {
            mime: r.mime,
            ext: r.ext
        },
        width: r.width,
        height: r.height,
        warnings: []
    };
}
async function detectTypeWithCheck(path) {
    // Check 0 byte
    const fileSize = await getFileSize(path);
    if (fileSize === 0) {
        return TYPE_OCTET_STREAM;
    }
    // 画像か判定＆サイズ取得
    const img = await detectImageSize(path);
    if (img) {
        // 画像だが検出対象でなければoctet-stream
        if (!FILE_TYPE_DETECTS.includes(img.mime)) {
            return TYPE_OCTET_STREAM;
        }
        // 画像だがサイズが制限を超えていたらoctet-stream
        if (img.width > 16383 || img.height > 16383) {
            return TYPE_OCTET_STREAM;
        }
        // 画像確定
        return {
            mime: img.mime,
            ext: img.ext,
            width: img.width,
            height: img.height
        };
    }
    // file-typeで認識
    const ft = await _filetype.fromFile(path);
    // 認識できなければoctet-stream
    if (!ft) {
        return TYPE_OCTET_STREAM;
    }
    // 検出対象でなければoctet-stream
    if (!FILE_TYPE_DETECTS.includes(ft.mime)) {
        return TYPE_OCTET_STREAM;
    }
    let type = {
        mime: ft.mime,
        ext: ft.ext
    };
    // mp4系の例外処理
    // 実際にストリームを含んでるかによってvideo/audioを分ける
    // ブラウザで再生できるかもしれないので全部mp4扱いにしてしまう
    if ([
        'video/quicktime',
        'video/mp4',
        'audio/mp4',
        'video/x-m4v',
        'audio/x-m4a',
        'video/3gpp',
        'video/3gpp2'
    ].includes(type.mime)) {
        const props = await getVideoProps(path);
        const hasVideo = props.streams.filter((s)=>s.codec_type === 'video').length > 0;
        if (hasVideo) {
            type = TYPE_MP4;
        } else {
            type = TYPE_MP4_AS_AUDIO;
        }
    }
    return type;
}
async function getFileSize(path) {
    const getStat = _util.promisify(_fs.stat);
    return (await getStat(path)).size;
}
async function calcHash(path) {
    const hash = _crypto.createHash('md5').setEncoding('hex');
    await pipeline(_fs.createReadStream(path), hash);
    return hash.read();
}
async function detectImageSize(path) {
    const readable = _fs.createReadStream(path);
    const probed = await _probeimagesize(readable).catch(()=>undefined);
    readable.destroy();
    if (probed) {
        return {
            mime: probed.mime,
            ext: probed.type,
            width: probed.width,
            height: probed.height,
            wUnits: probed.wUnits,
            hUnits: probed.hUnits
        };
    } else {
        return undefined;
    }
}
async function getVideoProps(path) {
    return new Promise((res, rej)=>{
        _fluentffmpeg({
            source: path
        }).ffprobe((err, data)=>{
            if (err) return rej(err);
            res(data);
        });
    });
}

//# sourceMappingURL=get-file-info.js.map
