"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    logger: function() {
        return logger;
    },
    UpdateInstanceinfo: function() {
        return UpdateInstanceinfo;
    },
    fetchInstanceinfo: function() {
        return fetchInstanceinfo;
    },
    fetchNodeinfo: function() {
        return fetchNodeinfo;
    }
});
const _fetch = require("../misc/fetch");
const _instance = require("../models/instance");
const _converthost = require("../misc/convert-host");
const _logger = require("./logger");
const _geoip = require("./geoip");
const _jsdom = require("jsdom");
const _config = require("../config");
const logger = new _logger.default('instanceinfo', 'cyan');
async function UpdateInstanceinfo(instance, request) {
    var _request;
    const _instance1 = await _instance.default.findOne({
        host: instance.host
    });
    if (!_instance1) throw 'Instance is not registed';
    const updateNeeded = ()=>{
        var _request;
        if (!_instance1.infoUpdatedAt) return true;
        const now = Date.now();
        if (now - _instance1.infoUpdatedAt.getTime() > 1000 * 60 * 60 * 24) return true;
        if (((_request = request) === null || _request === void 0 ? void 0 : _request.ip) && !_instance1.isp && now - _instance1.infoUpdatedAt.getTime() > 1000 * 60 * 60 * 1) return true;
        return false;
    };
    if (!updateNeeded()) return;
    await _instance.default.update({
        _id: instance._id
    }, {
        $set: {
            infoUpdatedAt: new Date()
        }
    });
    logger.info(`Fetching nodeinfo of ${instance.host} ...`);
    const info = await fetchInstanceinfo((0, _converthost.toApHost)(instance.host));
    logger.info(JSON.stringify(info, null, 2));
    const set = {
        infoUpdatedAt: new Date(),
        softwareName: info.softwareName,
        softwareVersion: info.softwareVersion,
        openRegistrations: info.openRegistrations,
        name: info.name,
        description: info.description,
        maintainerName: info.maintainerName,
        maintainerEmail: info.maintainerEmail,
        activeHalfyear: info.activeHalfyear,
        activeMonth: info.activeMonth
    };
    if (info.notesCount) set.notesCount = info.notesCount;
    if (info.usersCount) set.usersCount = info.usersCount;
    await _instance.default.update({
        _id: instance._id
    }, {
        $set: set
    });
    // GeoIP
    const geoip = ((_request = request) === null || _request === void 0 ? void 0 : _request.ip) && _config.default.enableInstanceGeoIp ? await (0, _geoip.geoIpLookup)(request.ip).catch((e)=>{
        logger.warn(`GeoIP failed for ${(0, _converthost.toApHost)(instance.host)} ${request.ip} ${e}`);
        return {
            cc: '??',
            isp: '??',
            org: '??',
            as: '??'
        };
    }) : null;
    if (geoip) {
        var _request1;
        logger.info(`GeoIP: ${(0, _converthost.toApHost)(instance.host)} ${(_request1 = request) === null || _request1 === void 0 ? void 0 : _request1.ip} => ${JSON.stringify(geoip)}`);
        await _instance.default.update({
            _id: instance._id
        }, {
            $set: {
                infoUpdatedAt: new Date(),
                cc: geoip.cc,
                isp: geoip.isp,
                org: geoip.org,
                as: geoip.as
            }
        });
    }
    // top
    const { iconUrl, manifestUrl } = await fetchTop(instance).catch((e)=>{
        logger.warn(`fetchTop failed for ${(0, _converthost.toApHost)(instance.host)} ${e}`);
        return {
            iconUrl: null,
            manifestUrl: null
        };
    });
    if (iconUrl) {
        logger.info(`iconUrl: ${(0, _converthost.toApHost)(instance.host)} => ${iconUrl}`);
        await _instance.default.update({
            _id: instance._id
        }, {
            $set: {
                iconUrl
            }
        });
    }
    if (manifestUrl) {
        var _manifest;
        const manifest = await fetchManifest(manifestUrl).catch((e)=>{
            logger.warn(`fetchManifest failed for ${(0, _converthost.toApHost)(instance.host)} ${e}`);
            return null;
        });
        if ((_manifest = manifest) === null || _manifest === void 0 ? void 0 : _manifest.theme_color) {
            logger.info(`themeColor: ${(0, _converthost.toApHost)(instance.host)} => ${manifest.theme_color}`);
            await _instance.default.update({
                _id: instance._id
            }, {
                $set: {
                    themeColor: manifest.theme_color
                }
            });
        }
    }
}
async function fetchInstanceinfo(host) {
    var _info_metadata, _info, _info_metadata1, _info1, _info_metadata2, _info2, _info_metadata3, _info3, _info_metadata_maintainer, _info_metadata4, _info4, _info_metadata_maintainer1, _info_metadata5, _info5, _info_software, _info6, _info_software1, _info7, _info8, _info_usage_users, _info_usage, _info9, _info_usage_users1, _info_usage1, _info10, _info_usage2, _info11, _info_usage3, _info12;
    // fetch nodeinfo
    const info = await fetchNodeinfo(host).catch(()=>null);
    let name = ((_info_metadata = (_info = info) === null || _info === void 0 ? void 0 : _info.metadata) === null || _info_metadata === void 0 ? void 0 : _info_metadata.nodeName) || ((_info_metadata1 = (_info1 = info) === null || _info1 === void 0 ? void 0 : _info1.metadata) === null || _info_metadata1 === void 0 ? void 0 : _info_metadata1.name) || null;
    let description = ((_info_metadata2 = (_info2 = info) === null || _info2 === void 0 ? void 0 : _info2.metadata) === null || _info_metadata2 === void 0 ? void 0 : _info_metadata2.nodeDescription) || ((_info_metadata3 = (_info3 = info) === null || _info3 === void 0 ? void 0 : _info3.metadata) === null || _info_metadata3 === void 0 ? void 0 : _info_metadata3.description) || null;
    const maintainerName = ((_info_metadata_maintainer = (_info_metadata4 = (_info4 = info) === null || _info4 === void 0 ? void 0 : _info4.metadata) === null || _info_metadata4 === void 0 ? void 0 : _info_metadata4.maintainer) === null || _info_metadata_maintainer === void 0 ? void 0 : _info_metadata_maintainer.name) || null;
    let maintainerEmail = ((_info_metadata_maintainer1 = (_info_metadata5 = (_info5 = info) === null || _info5 === void 0 ? void 0 : _info5.metadata) === null || _info_metadata5 === void 0 ? void 0 : _info_metadata5.maintainer) === null || _info_metadata_maintainer1 === void 0 ? void 0 : _info_metadata_maintainer1.email) || null;
    // fetch Mastodon API
    if (!name) {
        const mastodon = await fetchMastodonInstance((0, _converthost.toApHost)(host)).catch(()=>{});
        if (mastodon) {
            name = mastodon.title;
            description = mastodon.description;
            maintainerEmail = mastodon.email;
        }
    }
    return {
        softwareName: (_info_software = (_info6 = info) === null || _info6 === void 0 ? void 0 : _info6.software) === null || _info_software === void 0 ? void 0 : _info_software.name,
        softwareVersion: (_info_software1 = (_info7 = info) === null || _info7 === void 0 ? void 0 : _info7.software) === null || _info_software1 === void 0 ? void 0 : _info_software1.version,
        openRegistrations: (_info8 = info) === null || _info8 === void 0 ? void 0 : _info8.openRegistrations,
        name,
        description,
        maintainerName,
        maintainerEmail,
        activeHalfyear: expectNumber((_info_usage_users = (_info_usage = (_info9 = info) === null || _info9 === void 0 ? void 0 : _info9.usage) === null || _info_usage === void 0 ? void 0 : _info_usage.users) === null || _info_usage_users === void 0 ? void 0 : _info_usage_users.activeHalfyear),
        activeMonth: expectNumber((_info_usage_users1 = (_info_usage1 = (_info10 = info) === null || _info10 === void 0 ? void 0 : _info10.usage) === null || _info_usage1 === void 0 ? void 0 : _info_usage1.users) === null || _info_usage_users1 === void 0 ? void 0 : _info_usage_users1.activeMonth),
        usersCount: expectNumber((_info_usage2 = (_info11 = info) === null || _info11 === void 0 ? void 0 : _info11.usage) === null || _info_usage2 === void 0 ? void 0 : _info_usage2.users.total),
        notesCount: expectNumber((_info_usage3 = (_info12 = info) === null || _info12 === void 0 ? void 0 : _info12.usage) === null || _info_usage3 === void 0 ? void 0 : _info_usage3.localPosts)
    };
}
async function fetchNodeinfo(host) {
    const wellKnownUrl = `https://${host}/.well-known/nodeinfo`;
    const wellKnown = await (0, _fetch.getJson)(wellKnownUrl);
    const links = [
        '1.0',
        '1.1',
        '2.0',
        '2.1'
    ].map((v)=>wellKnown.links.find((link)=>link.rel === `http://nodeinfo.diaspora.software/ns/schema/${v}`)).filter((x)=>x != null);
    const link = links[0];
    if (!link) throw 'supported nodeinfo is not found';
    const nodeinfo = await (0, _fetch.getJson)(link.href);
    return nodeinfo;
}
async function fetchMastodonInstance(host) {
    const json = await (0, _fetch.getJson)(`https://${host}/api/v1/instance`);
    return json;
}
async function fetchTop(instance) {
    var _doc_querySelector_getAttribute, _this, _doc_querySelector_getAttribute1, _this1, _doc_querySelector_getAttribute2, _this2, _doc_querySelector_getAttribute3, _this3;
    const host = (0, _converthost.toApHost)(instance.host);
    logger.info(`Fetching icon URL of ${host} ...`);
    const url = 'https://' + host;
    const html = await (0, _fetch.getHtml)(url);
    const { window } = new _jsdom.JSDOM(html);
    const doc = window.document;
    const hrefAppleTouchIconPrecomposed = (_this = doc.querySelector('link[rel="apple-touch-icon-precomposed"]')) === null || _this === void 0 ? void 0 : (_doc_querySelector_getAttribute = _this.getAttribute) === null || _doc_querySelector_getAttribute === void 0 ? void 0 : _doc_querySelector_getAttribute.call(_this, 'href');
    const hrefAppleTouchIcon = (_this1 = doc.querySelector('link[rel="apple-touch-icon"]')) === null || _this1 === void 0 ? void 0 : (_doc_querySelector_getAttribute1 = _this1.getAttribute) === null || _doc_querySelector_getAttribute1 === void 0 ? void 0 : _doc_querySelector_getAttribute1.call(_this1, 'href');
    const hrefIcon = (_this2 = doc.querySelector('link[rel="icon"]')) === null || _this2 === void 0 ? void 0 : (_doc_querySelector_getAttribute2 = _this2.getAttribute) === null || _doc_querySelector_getAttribute2 === void 0 ? void 0 : _doc_querySelector_getAttribute2.call(_this2, 'href');
    const href = hrefIcon || hrefAppleTouchIconPrecomposed || hrefAppleTouchIcon || null;
    const iconUrl = href ? new URL(href, url).href : null;
    const manifestHref = (_this3 = doc.querySelector('link[rel="manifest"]')) === null || _this3 === void 0 ? void 0 : (_doc_querySelector_getAttribute3 = _this3.getAttribute) === null || _doc_querySelector_getAttribute3 === void 0 ? void 0 : _doc_querySelector_getAttribute3.call(_this3, 'href');
    const manifestUrl = manifestHref ? new URL(manifestHref, url).href : null;
    return {
        iconUrl,
        manifestUrl
    };
}
async function fetchManifest(url) {
    const json = await (0, _fetch.getJson)(url);
    return json;
}
function expectNumber(x) {
    if (typeof x === 'number') return x;
    return null;
}

//# sourceMappingURL=update-instanceinfo.js.map
