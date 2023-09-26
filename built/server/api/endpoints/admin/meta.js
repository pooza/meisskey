"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    meta: function() {
        return meta;
    },
    default: function() {
        return _default;
    }
});
const _os = require("os");
const _config = require("../../../../config");
const _emoji = require("../../../../models/emoji");
const _define = require("../../define");
const _fetchmeta = require("../../../../misc/fetch-meta");
const meta = {
    desc: {
        'ja-JP': '管理者向けインスタンス情報を取得します。',
        'en-US': 'Get the information for admin of this instance.'
    },
    tags: [
        'admin',
        'meta'
    ],
    requireCredential: true,
    requireAdmin: true,
    res: {
        type: 'object',
        properties: {
            version: {
                type: 'string',
                description: 'The version of Misskey of this instance.',
                example: _config.default.version
            },
            name: {
                type: 'string',
                description: 'The name of this instance.'
            },
            description: {
                type: 'string',
                description: 'The description of this instance.'
            },
            announcements: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The title of the announcement.'
                        },
                        text: {
                            type: 'string',
                            description: 'The text of the announcement. (can be HTML)'
                        }
                    }
                },
                description: 'The announcements of this instance.'
            },
            disableRegistration: {
                type: 'boolean',
                description: 'Whether disabled open registration.'
            },
            disableLocalTimeline: {
                type: 'boolean',
                description: 'Whether disabled LTL and STL.'
            },
            disableGlobalTimeline: {
                type: 'boolean',
                description: 'Whether disabled GTL.'
            },
            enableEmojiReaction: {
                type: 'boolean',
                description: 'Whether enabled emoji reaction.'
            },
            disableTimelinePreview: {
                type: 'boolean',
                description: 'Whether disabled unauthenticated Timeline.'
            },
            disableProfileDirectory: {
                type: 'boolean',
                description: 'Whether disabled unauthenticated Explore.'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, me)=>{
    const instance = await (0, _fetchmeta.default)();
    const emojis = await _emoji.default.find({
        host: null
    }, {
        fields: {
            _id: false
        },
        sort: {
            category: 1,
            name: 1
        }
    });
    const response = {
        maintainer: instance.maintainer,
        version: _config.default.version,
        name: instance.name,
        uri: _config.default.url,
        description: instance.description,
        langs: instance.langs,
        machine: _os.hostname(),
        os: _os.platform(),
        arch: _os.arch(),
        node: process.version,
        cpu: {
            model: _os.cpus()[0].model,
            cores: _os.cpus().length
        },
        announcements: instance.announcements || [],
        disableRegistration: instance.disableRegistration,
        disableLocalTimeline: instance.disableLocalTimeline,
        disableGlobalTimeline: instance.disableGlobalTimeline,
        showReplayInPublicTimeline: instance.showReplayInPublicTimeline,
        disableTimelinePreview: instance.disableTimelinePreview,
        disableProfileDirectory: instance.disableProfileDirectory,
        enableEmojiReaction: instance.enableEmojiReaction,
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
        emojis: emojis,
        enableEmail: instance.enableEmail,
        enableTwitterIntegration: instance.enableTwitterIntegration,
        enableGithubIntegration: instance.enableGithubIntegration,
        enableDiscordIntegration: instance.enableDiscordIntegration,
        enableServiceWorker: instance.enableServiceWorker
    };
    if (me && (me.isAdmin || me.isModerator)) {
        response.hidedTags = instance.hidedTags;
        response.blockedInstances = instance.blockedInstances;
        response.selfSilencedInstances = instance.selfSilencedInstances;
        response.exposeHome = instance.exposeHome;
        response.recaptchaSecretKey = instance.recaptchaSecretKey;
        response.proxyAccount = instance.proxyAccount;
        response.twitterConsumerKey = instance.twitterConsumerKey;
        response.twitterConsumerSecret = instance.twitterConsumerSecret;
        response.githubClientId = instance.githubClientId;
        response.githubClientSecret = instance.githubClientSecret;
        response.discordClientId = instance.discordClientId;
        response.discordClientSecret = instance.discordClientSecret;
        response.summalyProxy = instance.summalyProxy;
        response.email = instance.email;
        response.smtpSecure = instance.smtpSecure;
        response.smtpHost = instance.smtpHost;
        response.smtpPort = instance.smtpPort;
        response.smtpUser = instance.smtpUser;
        response.smtpPass = instance.smtpPass;
        response.swPrivateKey = instance.swPrivateKey;
    }
    return response;
});

//# sourceMappingURL=meta.js.map
