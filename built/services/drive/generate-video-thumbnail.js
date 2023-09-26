"use strict";
Object.defineProperty(exports, "generateVideoThumbnail", {
    enumerable: true,
    get: function() {
        return generateVideoThumbnail;
    }
});
const _tmp = require("tmp");
const _imageprocessor = require("./image-processor");
const _fluentffmpeg = require("fluent-ffmpeg");
async function generateVideoThumbnail(path) {
    const [outDir, cleanup] = await new Promise((res, rej)=>{
        _tmp.dir({
            unsafeCleanup: true
        }, (e, path, cleanup)=>{
            if (e) return rej(e);
            res([
                path,
                cleanup
            ]);
        });
    });
    try {
        await new Promise((res, rej)=>{
            _fluentffmpeg({
                source: path,
                timeout: 30
            }).on('end', res).on('error', rej).screenshot({
                folder: outDir,
                filename: 'output.png',
                count: 1,
                timestamps: [
                    '5%'
                ]
            });
        });
        const outPath = `${outDir}/output.png`;
        const thumbnail = await (0, _imageprocessor.convertToJpeg)(outPath, 530, 255);
        return thumbnail;
    } finally{
        cleanup();
    }
}

//# sourceMappingURL=generate-video-thumbnail.js.map
