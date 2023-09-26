"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("../db/mongodb");
const _config = require("../config");
const _user = require("./user");
const _cafyid = require("../misc/cafy-id");
const Meta = _mongodb.default.get('meta');
const _default = Meta;
// 後方互換性のため。
// 過去のMisskeyではインスタンス名や紹介を設定ファイルに記述していたのでそれを移行
if (_config.default.name) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.name == null) {
            Meta.update({}, {
                $set: {
                    name: _config.default.name
                }
            });
        }
    });
}
if (_config.default.description) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.description == null) {
            Meta.update({}, {
                $set: {
                    description: _config.default.description
                }
            });
        }
    });
}
if (_config.default.localDriveCapacityMb) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.localDriveCapacityMb == null) {
            Meta.update({}, {
                $set: {
                    localDriveCapacityMb: _config.default.localDriveCapacityMb
                }
            });
        }
    });
}
if (_config.default.remoteDriveCapacityMb) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.remoteDriveCapacityMb == null) {
            Meta.update({}, {
                $set: {
                    remoteDriveCapacityMb: _config.default.remoteDriveCapacityMb
                }
            });
        }
    });
}
if (_config.default.preventCacheRemoteFiles) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.cacheRemoteFiles == null) {
            Meta.update({}, {
                $set: {
                    cacheRemoteFiles: !_config.default.preventCacheRemoteFiles
                }
            });
        }
    });
}
if (_config.default.recaptcha) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.enableRecaptcha == null) {
            Meta.update({}, {
                $set: {
                    enableRecaptcha: _config.default.recaptcha != null,
                    recaptchaSiteKey: _config.default.recaptcha.site_key,
                    recaptchaSecretKey: _config.default.recaptcha.secret_key
                }
            });
        }
    });
}
if (_config.default.ghost) {
    Meta.findOne({}).then(async (m)=>{
        if (m != null && m.proxyAccount == null) {
            const account = await _user.default.findOne({
                _id: (0, _cafyid.transform)(_config.default.ghost)
            });
            Meta.update({}, {
                $set: {
                    proxyAccount: account.username
                }
            });
        }
    });
}
if (_config.default.maintainer) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.maintainer == null) {
            Meta.update({}, {
                $set: {
                    maintainer: _config.default.maintainer
                }
            });
        }
    });
}
if (_config.default.twitter) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.enableTwitterIntegration == null) {
            Meta.update({}, {
                $set: {
                    enableTwitterIntegration: true,
                    twitterConsumerKey: _config.default.twitter.consumer_key,
                    twitterConsumerSecret: _config.default.twitter.consumer_secret
                }
            });
        }
    });
}
if (_config.default.github) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.enableGithubIntegration == null) {
            Meta.update({}, {
                $set: {
                    enableGithubIntegration: true,
                    githubClientId: _config.default.github.client_id,
                    githubClientSecret: _config.default.github.client_secret
                }
            });
        }
    });
}
if (_config.default.sw) {
    Meta.findOne({}).then((m)=>{
        if (m != null && m.enableServiceWorker == null) {
            Meta.update({}, {
                $set: {
                    enableServiceWorker: true,
                    swPublicKey: _config.default.sw.public_key,
                    swPrivateKey: _config.default.sw.private_key
                }
            });
        }
    });
}
Meta.findOne({}).then((m)=>{
    if (m != null && m.broadcasts != null) {
        Meta.update({}, {
            $rename: {
                broadcasts: 'announcements'
            }
        });
    }
});

//# sourceMappingURL=meta.js.map
