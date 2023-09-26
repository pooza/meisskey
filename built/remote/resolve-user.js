"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _ = require("punycode/");
const _user = require("../models/user");
const _webfinger = require("./webfinger");
const _config = require("../config");
const _person = require("./activitypub/models/person");
const _url = require("url");
const _logger = require("./logger");
const logger = _logger.remoteLogger.createSubLogger('resolve-user');
const _default = async (username, _host, option, resync = false)=>{
    const usernameLower = username.toLowerCase();
    if (_host == null) {
        logger.info(`return local user: ${usernameLower}`);
        return await _user.default.findOne({
            usernameLower,
            host: null
        });
    }
    // disableFederationならリモート解決しない
    if (_config.default.disableFederation) return null;
    const configHostAscii = (0, _.toASCII)(_config.default.host).toLowerCase();
    const configHost = (0, _.toUnicode)(configHostAscii);
    const hostAscii = (0, _.toASCII)(_host).toLowerCase();
    const host = (0, _.toUnicode)(hostAscii);
    if (configHost == host) {
        logger.info(`return local user: ${usernameLower}`);
        return await _user.default.findOne({
            usernameLower,
            host: null
        });
    }
    const user = await _user.default.findOne({
        usernameLower,
        host
    }, option);
    const acctLower = `${usernameLower}@${hostAscii}`;
    if (user === null) {
        const self = await resolveSelf(acctLower);
        logger.succ(`return new remote user: ${acctLower}`);
        return await (0, _person.createPerson)(self.href);
    }
    // resyncオプション OR ユーザー情報が古い場合は、WebFilgerからやりなおして返す
    if (resync || user.lastFetchedAt == null || Date.now() - user.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24) {
        // 繋がらないインスタンスに何回も試行するのを防ぐ, 後続の同様処理の連続試行を防ぐ ため 試行前にも更新する
        await _user.default.update({
            _id: user._id
        }, {
            $set: {
                lastFetchedAt: new Date()
            }
        });
        try {
            logger.info(`try resync: ${acctLower}`);
            const self = await resolveSelf(acctLower);
            if (user.uri !== self.href) {
                // if uri mismatch, Fix (user@host <=> AP's Person id(IRemoteUser.uri)) mapping.
                logger.info(`uri missmatch: ${acctLower}`);
                logger.info(`recovery missmatch uri for (username=${username}, host=${host}) from ${user.uri} to ${self.href}`);
                // validate uri
                const uri = new _url.URL(self.href);
                if (uri.hostname !== hostAscii) {
                    throw new Error(`Invalid uri`);
                }
                await _user.default.update({
                    usernameLower,
                    host: host
                }, {
                    $set: {
                        uri: self.href
                    }
                });
            } else {
                logger.info(`uri is fine: ${acctLower}`);
            }
            await (0, _person.updatePerson)(self.href);
            logger.info(`return resynced remote user: ${acctLower}`);
            return await _user.default.findOne({
                uri: self.href
            });
        } catch (e) {
            logger.warn(`resync failed: ${e.message || e}`);
        }
    }
    logger.info(`return existing remote user: ${acctLower}`);
    return user;
};
async function resolveSelf(acctLower) {
    logger.info(`WebFinger for ${acctLower}`);
    const finger = await (0, _webfinger.default)(acctLower).catch((e)=>{
        logger.error(`Failed to WebFinger for ${acctLower}: ${e.statusCode || e.message}`);
        throw new Error(`Failed to WebFinger for ${acctLower}: ${e.statusCode || e.message}`);
    });
    const self = finger.links.find((link)=>link.rel && link.rel.toLowerCase() === 'self');
    if (!self) {
        logger.error(`Failed to WebFinger for ${acctLower}: self link not found`);
        throw new Error('self link not found');
    }
    return self;
}

//# sourceMappingURL=resolve-user.js.map
