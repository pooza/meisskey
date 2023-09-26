"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    links: function() {
        return links;
    },
    default: function() {
        return _default;
    }
});
const _router = require("@koa/router");
const _config = require("../config");
const _fetchmeta = require("../misc/fetch-meta");
const _user = require("../models/user");
const _constjson = require("../const.json");
const _relay = require("../models/relay");
const _fromhtml = require("../mfm/from-html");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const router = new _router();
const nodeinfo2_1path = '/nodeinfo/2.1';
const nodeinfo2_0path = '/nodeinfo/2.0';
const links = [
    /* (awaiting release) {
	rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1',
	href: config.url + nodeinfo2_1path
}, */ {
        rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0',
        href: _config.default.url + nodeinfo2_0path
    }
];
const nodeinfo2 = async ()=>{
    var _meta_stats, _meta_stats1;
    const meta = await (0, _fetchmeta.default)();
    const total = ((_meta_stats = meta.stats) === null || _meta_stats === void 0 ? void 0 : _meta_stats.originalUsersCount) || 0;
    const activeHalfyear = await _user.default.count({
        host: null,
        lastActivityAt: {
            $gt: new Date(Date.now() - 15552000000)
        }
    });
    const activeMonth = await _user.default.count({
        host: null,
        lastActivityAt: {
            $gt: new Date(Date.now() - 2592000000)
        }
    });
    const localPosts = (_meta_stats1 = meta.stats) === null || _meta_stats1 === void 0 ? void 0 : _meta_stats1.originalNotesCount;
    const localComments = 0;
    const relayActor = await _user.default.findOne({
        host: null,
        username: 'relay.actor'
    });
    const relays = await _relay.default.find({
        status: 'accepted'
    });
    const relayedHosts = relays.map((x)=>{
        try {
            return new URL(x.inbox).hostname;
        } catch (e) {
            return null;
        }
    }).filter((x)=>x != null);
    const nodeName = meta.name || 'Misskey';
    const nodeDescription = (0, _fromhtml.fromHtml)(meta.description || '');
    return {
        software: {
            name: 'meisskey',
            version: _config.default.version,
            repository: `${_constjson.repositoryUrl}`
        },
        protocols: [
            'activitypub'
        ],
        services: {
            inbound: [],
            outbound: [
                'atom1.0',
                'rss2.0'
            ]
        },
        openRegistrations: !meta.disableRegistration,
        usage: {
            users: {
                total,
                activeHalfyear,
                activeMonth
            },
            localPosts,
            localComments
        },
        metadata: {
            nodeName,
            nodeDescription,
            name: nodeName,
            description: nodeDescription,
            maintainer: meta.maintainer,
            langs: meta.langs,
            announcements: meta.announcements,
            relayActor: relayActor ? `${_config.default.url}/users/${relayActor._id}` : null,
            relays: relayedHosts,
            disableRegistration: meta.disableRegistration,
            disableLocalTimeline: meta.disableLocalTimeline,
            disableGlobalTimeline: meta.disableGlobalTimeline,
            enableRecaptcha: meta.enableRecaptcha,
            maxNoteTextLength: meta.maxNoteTextLength,
            enableTwitterIntegration: meta.enableTwitterIntegration,
            enableGithubIntegration: meta.enableGithubIntegration,
            enableDiscordIntegration: meta.enableDiscordIntegration,
            enableEmail: meta.enableEmail,
            enableServiceWorker: meta.enableServiceWorker,
            proxyAccountName: meta.proxyAccount || null
        }
    };
};
router.get(nodeinfo2_1path, async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    const base = await nodeinfo2();
    ctx.body = _object_spread({
        version: '2.1'
    }, base);
    ctx.set('Cache-Control', 'public, max-age=600');
});
router.get(nodeinfo2_0path, async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    const base = await nodeinfo2();
    delete base.software.repository;
    ctx.body = _object_spread({
        version: '2.0'
    }, base);
    ctx.set('Cache-Control', 'public, max-age=3600');
});
const _default = router;

//# sourceMappingURL=nodeinfo.js.map
