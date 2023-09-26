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
const _cafy = require("cafy");
const _meta = require("../../../../models/meta");
const _define = require("../../define");
const _converthost = require("../../../../misc/convert-host");
const _serverevent = require("../../../../services/server-event");
const meta = {
    desc: {
        'ja-JP': 'インスタンスの設定を更新します。'
    },
    tags: [
        'admin'
    ],
    requireCredential: true,
    requireAdmin: true,
    params: {
        announcements: {
            validator: _cafy.default.optional.nullable.arr(_cafy.default.obj()),
            desc: {
                'ja-JP': 'お知らせ'
            }
        },
        disableRegistration: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': '招待制か否か'
            }
        },
        disableLocalTimeline: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': 'ローカルタイムライン(とソーシャルタイムライン)を無効にするか否か'
            }
        },
        disableGlobalTimeline: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': 'グローバルタイムラインを無効にするか否か'
            }
        },
        showReplayInPublicTimeline: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': 'showReplayInPublicTimeline'
            }
        },
        disableTimelinePreview: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': '未認証時のタイムラインを無効にするか否か'
            }
        },
        disableProfileDirectory: {
            validator: _cafy.default.optional.nullable.bool,
            desc: {
                'ja-JP': '未認証時のみつけるを無効にするか否か'
            }
        },
        hidedTags: {
            validator: _cafy.default.optional.nullable.arr(_cafy.default.str),
            desc: {
                'ja-JP': '統計などで無視するハッシュタグ'
            }
        },
        blockedInstances: {
            validator: _cafy.default.optional.nullable.arr(_cafy.default.str),
            desc: {
                'ja-JP': 'blockedInstances'
            }
        },
        selfSilencedInstances: {
            validator: _cafy.default.optional.nullable.arr(_cafy.default.str),
            desc: {
                'ja-JP': 'selfSilencedInstances'
            }
        },
        exposeHome: {
            validator: _cafy.default.optional.boolean,
            desc: {
                'ja-JP': 'exposeHome'
            }
        },
        mascotImageUrl: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンスキャラクター画像のURL'
            }
        },
        bannerUrl: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンスのバナー画像URL'
            }
        },
        iconUrl: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンスのアイコンURL'
            }
        },
        name: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンス名'
            }
        },
        description: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンスの紹介文'
            }
        },
        maxNoteTextLength: {
            validator: _cafy.default.optional.num.min(0),
            desc: {
                'ja-JP': '投稿の最大文字数'
            }
        },
        localDriveCapacityMb: {
            validator: _cafy.default.optional.num.min(0),
            desc: {
                'ja-JP': 'ローカルユーザーひとりあたりのドライブ容量 (メガバイト単位)',
                'en-US': 'Drive capacity of a local user (MB)'
            }
        },
        remoteDriveCapacityMb: {
            validator: _cafy.default.optional.num.min(0),
            desc: {
                'ja-JP': 'リモートユーザーひとりあたりのドライブ容量 (メガバイト単位)',
                'en-US': 'Drive capacity of a remote user (MB)'
            }
        },
        cacheRemoteFiles: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'リモートのファイルをキャッシュするか否か'
            }
        },
        enableRecaptcha: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'reCAPTCHAを使用するか否か'
            }
        },
        recaptchaSiteKey: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'reCAPTCHA site key'
            }
        },
        recaptchaSecretKey: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'reCAPTCHA secret key'
            }
        },
        proxyAccount: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'プロキシアカウントのユーザー名'
            }
        },
        maintainerName: {
            validator: _cafy.default.optional.str,
            desc: {
                'ja-JP': 'インスタンスの管理者名'
            }
        },
        maintainerEmail: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'インスタンス管理者の連絡先メールアドレス'
            }
        },
        langs: {
            validator: _cafy.default.optional.arr(_cafy.default.str),
            desc: {
                'ja-JP': 'インスタンスの対象言語'
            }
        },
        summalyProxy: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'summalyプロキシURL'
            }
        },
        enableTwitterIntegration: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'Twitter連携機能を有効にするか否か'
            }
        },
        twitterConsumerKey: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'TwitterアプリのConsumer key'
            }
        },
        twitterConsumerSecret: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'TwitterアプリのConsumer secret'
            }
        },
        enableGithubIntegration: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'GitHub連携機能を有効にするか否か'
            }
        },
        githubClientId: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'GitHubアプリのClient ID'
            }
        },
        githubClientSecret: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'GitHubアプリのClient Secret'
            }
        },
        enableDiscordIntegration: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'Discord連携機能を有効にするか否か'
            }
        },
        discordClientId: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'DiscordアプリのClient ID'
            }
        },
        discordClientSecret: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'DiscordアプリのClient Secret'
            }
        },
        enableEmail: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'メール配信を有効にするか否か'
            }
        },
        email: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'メール配信する際に利用するメールアドレス'
            }
        },
        smtpSecure: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'SMTPサーバがSSLを使用しているか否か'
            }
        },
        smtpHost: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'SMTPサーバのホスト'
            }
        },
        smtpPort: {
            validator: _cafy.default.optional.nullable.num,
            desc: {
                'ja-JP': 'SMTPサーバのポート'
            }
        },
        smtpUser: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'SMTPサーバのユーザー名'
            }
        },
        smtpPass: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'SMTPサーバのパスワード'
            }
        },
        enableServiceWorker: {
            validator: _cafy.default.optional.bool,
            desc: {
                'ja-JP': 'ServiceWorkerを有効にするか否か'
            }
        },
        swPublicKey: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'ServiceWorkerのVAPIDキーペアの公開鍵'
            }
        },
        swPrivateKey: {
            validator: _cafy.default.optional.nullable.str,
            desc: {
                'ja-JP': 'ServiceWorkerのVAPIDキーペアの秘密鍵'
            }
        }
    }
};
const _default = (0, _define.default)(meta, async (ps)=>{
    const set = {};
    if (ps.announcements) {
        set.announcements = ps.announcements;
    }
    if (typeof ps.disableRegistration === 'boolean') {
        set.disableRegistration = ps.disableRegistration;
    }
    if (typeof ps.disableLocalTimeline === 'boolean') {
        set.disableLocalTimeline = ps.disableLocalTimeline;
    }
    if (typeof ps.disableGlobalTimeline === 'boolean') {
        set.disableGlobalTimeline = ps.disableGlobalTimeline;
    }
    if (typeof ps.showReplayInPublicTimeline === 'boolean') {
        set.showReplayInPublicTimeline = ps.showReplayInPublicTimeline;
    }
    if (typeof ps.disableTimelinePreview === 'boolean') {
        set.disableTimelinePreview = ps.disableTimelinePreview;
    }
    if (typeof ps.disableProfileDirectory === 'boolean') {
        set.disableProfileDirectory = ps.disableProfileDirectory;
    }
    if (Array.isArray(ps.hidedTags)) {
        set.hidedTags = ps.hidedTags.map((x)=>x.trim()).filter((x)=>x !== '');
    }
    if (Array.isArray(ps.blockedInstances)) {
        set.blockedInstances = ps.blockedInstances.map((x)=>x.trim()).filter((x)=>x !== '').map((x)=>(0, _converthost.toApHost)(x));
    }
    if (Array.isArray(ps.selfSilencedInstances)) {
        set.selfSilencedInstances = ps.selfSilencedInstances.map((x)=>x.trim()).filter((x)=>x !== '').map((x)=>(0, _converthost.toApHost)(x));
    }
    if (typeof ps.exposeHome === 'boolean') {
        set.exposeHome = ps.exposeHome;
    }
    if (ps.mascotImageUrl !== undefined) {
        set.mascotImageUrl = ps.mascotImageUrl;
    }
    if (ps.bannerUrl !== undefined) {
        set.bannerUrl = ps.bannerUrl;
    }
    if (ps.iconUrl !== undefined) {
        set.iconUrl = ps.iconUrl;
    }
    if (ps.name !== undefined) {
        set.name = ps.name;
    }
    if (ps.description !== undefined) {
        set.description = ps.description;
    }
    if (ps.maxNoteTextLength) {
        set.maxNoteTextLength = ps.maxNoteTextLength;
    }
    if (ps.localDriveCapacityMb !== undefined) {
        set.localDriveCapacityMb = ps.localDriveCapacityMb;
    }
    if (ps.remoteDriveCapacityMb !== undefined) {
        set.remoteDriveCapacityMb = ps.remoteDriveCapacityMb;
    }
    if (ps.cacheRemoteFiles !== undefined) {
        set.cacheRemoteFiles = ps.cacheRemoteFiles;
    }
    if (ps.enableRecaptcha !== undefined) {
        set.enableRecaptcha = ps.enableRecaptcha;
    }
    if (ps.recaptchaSiteKey !== undefined) {
        set.recaptchaSiteKey = ps.recaptchaSiteKey;
    }
    if (ps.recaptchaSecretKey !== undefined) {
        set.recaptchaSecretKey = ps.recaptchaSecretKey;
    }
    if (ps.proxyAccount !== undefined) {
        set.proxyAccount = ps.proxyAccount;
    }
    if (ps.maintainerName !== undefined) {
        set['maintainer.name'] = ps.maintainerName;
    }
    if (ps.maintainerEmail !== undefined) {
        set['maintainer.email'] = ps.maintainerEmail;
    }
    if (Array.isArray(ps.langs)) {
        set.langs = ps.langs.map((x)=>x.trim()).filter((x)=>x !== '');
    }
    if (ps.summalyProxy !== undefined) {
        set.summalyProxy = ps.summalyProxy;
    }
    if (ps.enableTwitterIntegration !== undefined) {
        set.enableTwitterIntegration = ps.enableTwitterIntegration;
    }
    if (ps.twitterConsumerKey !== undefined) {
        set.twitterConsumerKey = ps.twitterConsumerKey;
    }
    if (ps.twitterConsumerSecret !== undefined) {
        set.twitterConsumerSecret = ps.twitterConsumerSecret;
    }
    if (ps.enableGithubIntegration !== undefined) {
        set.enableGithubIntegration = ps.enableGithubIntegration;
    }
    if (ps.githubClientId !== undefined) {
        set.githubClientId = ps.githubClientId;
    }
    if (ps.githubClientSecret !== undefined) {
        set.githubClientSecret = ps.githubClientSecret;
    }
    if (ps.enableDiscordIntegration !== undefined) {
        set.enableDiscordIntegration = ps.enableDiscordIntegration;
    }
    if (ps.discordClientId !== undefined) {
        set.discordClientId = ps.discordClientId;
    }
    if (ps.discordClientSecret !== undefined) {
        set.discordClientSecret = ps.discordClientSecret;
    }
    if (ps.enableEmail !== undefined) {
        set.enableEmail = ps.enableEmail;
    }
    if (ps.email !== undefined) {
        set.email = ps.email;
    }
    if (ps.smtpSecure !== undefined) {
        set.smtpSecure = ps.smtpSecure;
    }
    if (ps.smtpHost !== undefined) {
        set.smtpHost = ps.smtpHost;
    }
    if (ps.smtpPort !== undefined) {
        set.smtpPort = ps.smtpPort;
    }
    if (ps.smtpUser !== undefined) {
        set.smtpUser = ps.smtpUser;
    }
    if (ps.smtpPass !== undefined) {
        set.smtpPass = ps.smtpPass;
    }
    if (ps.enableServiceWorker !== undefined) {
        set.enableServiceWorker = ps.enableServiceWorker;
    }
    if (ps.swPublicKey !== undefined) {
        set.swPublicKey = ps.swPublicKey;
    }
    if (ps.swPrivateKey !== undefined) {
        set.swPrivateKey = ps.swPrivateKey;
    }
    await _meta.default.update({}, {
        $set: set
    }, {
        upsert: true
    });
    if (set.blockedInstances || set.selfSilencedInstances) {
        (0, _serverevent.publishInstanceModUpdated)();
    }
    return;
});

//# sourceMappingURL=update-meta.js.map
