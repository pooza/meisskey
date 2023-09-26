"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    convertToJpeg: function() {
        return convertToJpeg;
    },
    convertSharpToJpeg: function() {
        return convertSharpToJpeg;
    },
    convertToWebp: function() {
        return convertToWebp;
    },
    convertSharpToWebp: function() {
        return convertSharpToWebp;
    },
    convertToAvif: function() {
        return convertToAvif;
    },
    convertSharpToAvif: function() {
        return convertSharpToAvif;
    },
    convertToPng: function() {
        return convertToPng;
    },
    convertSharpToPng: function() {
        return convertSharpToPng;
    },
    convertToPngOrJpeg: function() {
        return convertToPngOrJpeg;
    },
    convertSharpToPngOrJpeg: function() {
        return convertSharpToPngOrJpeg;
    }
});
const _sharp = require("sharp");
async function convertToJpeg(path, width, height, jpegOpts) {
    return convertSharpToJpeg(await _sharp(path), width, height, jpegOpts);
}
async function convertSharpToJpeg(sharp, width, height, jpegOpts) {
    var _jpegOpts, _jpegOpts1, _jpegOpts2;
    const jpegOptions = {
        progressive: true,
        quality: ((_jpegOpts = jpegOpts) === null || _jpegOpts === void 0 ? void 0 : _jpegOpts.quality) || 85,
        chromaSubsampling: ((_jpegOpts1 = jpegOpts) === null || _jpegOpts1 === void 0 ? void 0 : _jpegOpts1.disableSubsampling) ? '4:4:4' : '4:2:0',
        mozjpeg: ((_jpegOpts2 = jpegOpts) === null || _jpegOpts2 === void 0 ? void 0 : _jpegOpts2.useMozjpeg) ? true : false
    };
    const data = await sharp.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
    }).rotate().jpeg(jpegOptions).toBuffer();
    return {
        data,
        ext: 'jpg',
        type: 'image/jpeg'
    };
}
async function convertToWebp(path, width, height, webpOpts) {
    return convertSharpToWebp(await _sharp(path), width, height);
}
async function convertSharpToWebp(sharp, width, height, webpOpts) {
    var _webpOpts, _webpOpts1;
    var _webpOpts_smartSubsample;
    const webpOptions = {
        quality: ((_webpOpts = webpOpts) === null || _webpOpts === void 0 ? void 0 : _webpOpts.quality) || 85,
        smartSubsample: (_webpOpts_smartSubsample = (_webpOpts1 = webpOpts) === null || _webpOpts1 === void 0 ? void 0 : _webpOpts1.smartSubsample) !== null && _webpOpts_smartSubsample !== void 0 ? _webpOpts_smartSubsample : false
    };
    const data = await sharp.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
    }).rotate().webp(webpOptions).toBuffer();
    return {
        data,
        ext: 'webp',
        type: 'image/webp'
    };
}
async function convertToAvif(path, width, height, avifOpts) {
    return convertSharpToAvif(await _sharp(path), width, height);
}
async function convertSharpToAvif(sharp, width, height, avifOpts) {
    var _avifOpts;
    const avifOptions = {
        quality: ((_avifOpts = avifOpts) === null || _avifOpts === void 0 ? void 0 : _avifOpts.quality) || 65
    };
    const data = await sharp.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
    }).rotate().avif(avifOptions).toBuffer();
    return {
        data,
        ext: 'avif',
        type: 'image/avif'
    };
}
async function convertToPng(path, width, height) {
    return convertSharpToPng(await _sharp(path), width, height);
}
async function convertSharpToPng(sharp, width, height) {
    const data = await sharp.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
    }).rotate().png().toBuffer();
    return {
        data,
        ext: 'png',
        type: 'image/png'
    };
}
async function convertToPngOrJpeg(path, width, height) {
    return convertSharpToPngOrJpeg(await _sharp(path), width, height);
}
async function convertSharpToPngOrJpeg(sharp, width, height) {
    const stats = await sharp.stats();
    const metadata = await sharp.metadata();
    // 不透明で300x300pxの範囲を超えていればJPEG
    if (stats.isOpaque && (metadata.width >= 300 || metadata.height >= 300)) {
        return await convertSharpToJpeg(sharp, width, height);
    } else {
        return await convertSharpToPng(sharp, width, height);
    }
}

//# sourceMappingURL=image-processor.js.map
