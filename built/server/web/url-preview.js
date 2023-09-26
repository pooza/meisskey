"use strict";
const _tmp = require("tmp");
const _fs = require("fs");
const _fetch = require("../../misc/fetch");
const _summaly = require("summaly");
const _fetchmeta = require("../../misc/fetch-meta");
const _logger = require("../../services/logger");
const _config = require("../../config");
const _url = require("../../prelude/url");
const _downloadurl = require("../../misc/download-url");
const _getfileinfo = require("../../misc/get-file-info");
const _imageprocessor = require("../../services/drive/image-processor");
const _sanitizeurl = require("../../misc/sanitize-url");
const logger = new _logger.default('url-preview');
//#region SummaryInstance
let summaryInstance = null;
function getSummaryInstance() {
    if (summaryInstance) return summaryInstance;
    summaryInstance = new _summaly.Summary({
        allowedPlugins: [
            //'twitter',
            'youtube',
            'dlsite'
        ]
    });
    return summaryInstance;
}
//#endregion
module.exports = async (ctx)=>{
    if (_config.default.disableUrlPreview) {
        ctx.status = 403;
        ctx.set('Cache-Control', 'max-age=3600');
        return;
    }
    const meta = await (0, _fetchmeta.default)();
    const url = (0, _sanitizeurl.sanitizeUrl)(ctx.query.url);
    if (url == null) {
        ctx.status = 400;
        ctx.set('Cache-Control', 'max-age=3600');
        return;
    }
    const lang = ctx.query.lang || 'ja-JP';
    logger.info(meta.summalyProxy ? `(Proxy) Getting preview of ${url}@${lang} ...` : `Getting preview of ${url}@${lang} ...`);
    try {
        var _summary_player_url, _summary_player;
        const summary = meta.summalyProxy ? await (0, _fetch.getJson)(`${meta.summalyProxy}?${(0, _url.query)({
            url: url,
            lang: lang
        })}`) : await getSummaryInstance().summary(url, {
            lang: lang
        });
        logger.succ(`Got preview of ${url}: ${summary.title}`);
        summary.icon = await wrap(summary.icon, 32);
        summary.thumbnail = await wrap(summary.thumbnail, 128);
        if (summary.player) summary.player.url = (0, _sanitizeurl.sanitizeUrl)(summary.player.url);
        summary.url = (0, _sanitizeurl.sanitizeUrl)(summary.url);
        if ((_summary_player = summary.player) === null || _summary_player === void 0 ? void 0 : (_summary_player_url = _summary_player.url) === null || _summary_player_url === void 0 ? void 0 : _summary_player_url.startsWith('https://player.twitch.tv/')) {
            summary.player.url = summary.player.url.replace('parent=meta.tag', `parent=${_config.default.url.replace(/^https?:[/][/]/, '')}`);
        }
        // Cache 7days
        ctx.set('Cache-Control', 'max-age=604800');
        ctx.body = summary;
    } catch (e) {
        logger.error(`Failed to get preview of ${url}: ${e}`);
        ctx.status = 200;
        ctx.set('Cache-Control', 'max-age=3600');
        ctx.body = {};
    }
};
async function wrap(url, size = 128) {
    if (url == null) return null;
    if (url.match(/^https?:/)) {
        return await convertDataUri(url, size);
    }
    if (url.match(/^data:/)) {
        return url;
    }
    return null;
}
async function convertDataUri(url, size = 128) {
    if (url == null) return null;
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
        const imageSize = await (0, _getfileinfo.detectImageSize)(path);
        if (!imageSize) return null;
        if (imageSize.wUnits === 'px' && (imageSize.width > 16383 || imageSize.height > 16383)) return null;
        if ([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/avif'
        ].includes(imageSize.mime)) {
            const image = await (0, _imageprocessor.convertToWebp)(path, size, size);
            return `data:image/webp;base64,${image.data.toString('base64')}`;
        }
        if ([
            'image/x-icon'
        ].includes(imageSize.mime)) {
            return `data:image/x-icon;base64,${(await _fs.promises.readFile(path)).toString('base64')}`;
        }
        return null;
    } catch (e) {
        return null;
    } finally{
        cleanup();
    }
}

//# sourceMappingURL=url-preview.js.map
