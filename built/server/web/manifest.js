"use strict";
const _manifestjson = require("../../client/assets/manifest.json");
const _deepcopy = require("deepcopy");
const _fetchmeta = require("../../misc/fetch-meta");
const _config = require("../../config");
module.exports = async (ctx)=>{
    const json = _deepcopy(_manifestjson);
    const instance = await (0, _fetchmeta.default)();
    json.short_name = instance.name || 'Misskey';
    json.name = instance.name || 'Misskey';
    for (const x of json.icons){
        var _config_icons_manifest192, _config_icons, _config_icons_manifest512, _config_icons1;
        if (x.sizes === '192x192' && ((_config_icons_manifest192 = (_config_icons = _config.default.icons) === null || _config_icons === void 0 ? void 0 : _config_icons.manifest192) === null || _config_icons_manifest192 === void 0 ? void 0 : _config_icons_manifest192.url)) {
            x.src = _config.default.icons.manifest192.url;
        }
        if (x.sizes === '512x512' && ((_config_icons_manifest512 = (_config_icons1 = _config.default.icons) === null || _config_icons1 === void 0 ? void 0 : _config_icons1.manifest512) === null || _config_icons_manifest512 === void 0 ? void 0 : _config_icons_manifest512.url)) {
            x.src = _config.default.icons.manifest512.url;
        }
    }
    json.theme_color = _config.default.themeColor || '#fb4e4e';
    ctx.set('Cache-Control', 'max-age=300');
    ctx.body = json;
};

//# sourceMappingURL=manifest.js.map
