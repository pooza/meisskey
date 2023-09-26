"use strict";
Object.defineProperty(exports, "buildMeta", {
    enumerable: true,
    get: function() {
        return buildMeta;
    }
});
const _emoji = require("../models/emoji");
const _config = require("../config");
const _os = require("os");
const _relay = require("../models/relay");
async function buildMeta(instance, detail = true) {
    const [emojis, relays] = await Promise.all([
        _emoji.default.find({
            host: null
        }, {
            sort: {
                category: 1,
                name: 1
            }
        }),
        _relay.default.find({
            status: 'accepted'
        })
    ]);
    const response = {
        maintainer: instance.maintainer,
        version: _config.default.version,
        name: instance.name,
        uri: _config.default.url,
        description: instance.description,
        langs: instance.langs,
        machine: _config.default.hideServerInfo ? 'Unknown' : _os.hostname(),
        os: _config.default.hideServerInfo ? 'Unknown' : _os.platform(),
        arch: _config.default.hideServerInfo ? 'Unknown' : _os.arch(),
        node: _config.default.hideServerInfo ? 'Unknown' : process.version,
        cpu: {
            model: _config.default.hideServerInfo ? 'Unknown' : _os.cpus()[0].model,
            cores: _config.default.hideServerInfo ? 'Unknown' : _os.cpus().length
        },
        announcements: instance.announcements || [],
        disableRegistration: instance.disableRegistration,
        disableLocalTimeline: instance.disableLocalTimeline,
        disableGlobalTimeline: instance.disableGlobalTimeline,
        showReplayInPublicTimeline: instance.showReplayInPublicTimeline,
        disableTimelinePreview: instance.disableTimelinePreview,
        disableProfileDirectory: instance.disableProfileDirectory,
        enableEmojiReaction: true,
        driveCapacityPerLocalUserMb: instance.localDriveCapacityMb,
        driveCapacityPerRemoteUserMb: instance.remoteDriveCapacityMb,
        cacheRemoteFiles: instance.cacheRemoteFiles,
        enableRecaptcha: instance.enableRecaptcha,
        recaptchaSiteKey: instance.recaptchaSiteKey,
        swPublickey: instance.swPublicKey,
        mascotImageUrl: instance.mascotImageUrl,
        bannerUrl: instance.bannerUrl,
        iconUrl: instance.iconUrl,
        maxNoteTextLength: instance.maxNoteTextLength,
        emojis: emojis.map((e)=>{
            const r = {
                aliases: e.aliases,
                name: e.name,
                category: e.category,
                url: e.url
            };
            if (e.direction) {
                r.direction = e.direction;
            }
            return r;
        }),
        relays: relays.map((x)=>{
            try {
                const u = new URL(x.inbox);
                return {
                    host: u.host
                };
            } catch (e) {
                return null;
            }
        }).filter((x)=>x != null),
        enableEmail: instance.enableEmail,
        enableTwitterIntegration: instance.enableTwitterIntegration,
        enableGithubIntegration: instance.enableGithubIntegration,
        enableDiscordIntegration: instance.enableDiscordIntegration,
        enableServiceWorker: instance.enableServiceWorker,
        proxyAccountName: instance.proxyAccount || null,
        minimumAge: _config.default.minimumAge
    };
    if (detail) {
        response.features = {
            registration: !instance.disableRegistration,
            localTimeLine: !instance.disableLocalTimeline,
            globalTimeLine: !instance.disableGlobalTimeline,
            elasticsearch: false,
            recaptcha: instance.enableRecaptcha,
            objectStorage: _config.default.drive && _config.default.drive.storage === 'minio',
            twitter: instance.enableTwitterIntegration,
            github: instance.enableGithubIntegration,
            discord: instance.enableDiscordIntegration,
            serviceWorker: instance.enableServiceWorker
        };
    }
    return response;
}

//# sourceMappingURL=build-meta.js.map
