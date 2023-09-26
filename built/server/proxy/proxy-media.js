"use strict";
Object.defineProperty(exports, "proxyMedia", {
    enumerable: true,
    get: function() {
        return proxyMedia;
    }
});
const _fs = require("fs");
const _ = require("..");
const _imageprocessor = require("../../services/drive/image-processor");
const _createtemp = require("../../misc/create-temp");
const _downloadurl = require("../../misc/download-url");
const _getfileinfo = require("../../misc/get-file-info");
const _fetch = require("../../misc/fetch");
async function proxyMedia(ctx) {
    const url = 'url' in ctx.query ? ctx.query.url : 'https://' + ctx.params.url;
    if (typeof url !== 'string') {
        ctx.status = 400;
        ctx.set('Cache-Control', 'max-age=86400');
        return;
    }
    // Create temp file
    const [path, cleanup] = await (0, _createtemp.createTemp)();
    try {
        await (0, _downloadurl.downloadUrl)(url, path);
        const { mime, ext } = await (0, _getfileinfo.detectTypeWithCheck)(path);
        let image;
        if ('static' in ctx.query && [
            'image/png',
            'image/apng',
            'image/gif',
            'image/webp',
            'image/avif',
            'image/svg+xml'
        ].includes(mime)) {
            image = await (0, _imageprocessor.convertToWebp)(path, 530, 255);
        } else if ('preview' in ctx.query && [
            'image/jpeg',
            'image/png',
            'image/apng',
            'image/gif',
            'image/webp',
            'image/avif',
            'image/svg+xml'
        ].includes(mime)) {
            image = await (0, _imageprocessor.convertToWebp)(path, 200, 200);
        } else if ([
            'image/svg+xml'
        ].includes(mime)) {
            image = await (0, _imageprocessor.convertToWebp)(path, 2048, 2048);
        } else if (!mime.startsWith('image/') || !_getfileinfo.FILE_TYPE_BROWSERSAFE.includes(mime)) {
            throw new _fetch.StatusError('Rejected type', 403, 'Rejected type');
        } else {
            image = {
                data: await _fs.promises.readFile(path),
                ext: ext || '',
                type: mime
            };
        }
        ctx.body = image.data;
        ctx.set('Content-Type', image.type);
        ctx.set('Cache-Control', 'max-age=604800, immutable');
    } catch (e) {
        _.serverLogger.error(e);
        if (e instanceof _fetch.StatusError && e.isClientError) {
            ctx.status = e.statusCode;
            ctx.set('Cache-Control', 'max-age=86400');
        } else {
            ctx.status = 500;
            ctx.set('Cache-Control', 'max-age=300');
        }
    } finally{
        cleanup();
    }
}

//# sourceMappingURL=proxy-media.js.map
