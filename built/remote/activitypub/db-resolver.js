"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return DbResolver;
    }
});
const _mongodb = require("mongodb");
const _config = require("../../config");
const _user = require("../../models/user");
const _note = require("../../models/note");
const _type = require("./type");
const _escaperegexp = require("escape-regexp");
const _messagingmessage = require("../../models/messaging-message");
let DbResolver = class DbResolver {
    /**
	 * AP Note => Misskey Note in DB
	 */ async getNoteFromApId(value) {
        const parsed = this.parseUri(value);
        if (parsed.id) {
            return await _note.default.findOne({
                _id: new _mongodb.ObjectID(parsed.id),
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        if (parsed.uri) {
            return await _note.default.findOne({
                uri: parsed.uri,
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        return null;
    }
    async getMessageFromApId(value) {
        const parsed = this.parseUri(value);
        if (parsed.id) {
            return await _messagingmessage.default.findOne({
                _id: new _mongodb.ObjectID(parsed.id),
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        if (parsed.uri) {
            return await _messagingmessage.default.findOne({
                uri: parsed.uri,
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        return null;
    }
    async getRemoteUserFromKeyId(keyId) {
        const user = await _user.default.findOne({
            host: {
                $ne: null
            },
            'publicKey.id': keyId,
            deletedAt: {
                $exists: false
            }
        });
        return user || null;
    }
    /**
	 * AP Person => Misskey User in DB
	 */ async getUserFromApId(value) {
        const parsed = this.parseUri(value);
        if (parsed.id) {
            return await _user.default.findOne({
                _id: new _mongodb.ObjectID(parsed.id),
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        if (parsed.uri) {
            return await _user.default.findOne({
                uri: parsed.uri,
                deletedAt: {
                    $exists: false
                }
            }) || null;
        }
        return null;
    }
    parseUri(value) {
        const uri = (0, _type.getApId)(value);
        const localRegex = new RegExp('^' + _escaperegexp(_config.default.url) + '/' + '(\\w+)' + '/' + '(\\w+)');
        const matchLocal = uri.match(localRegex);
        if (matchLocal) {
            return {
                type: matchLocal[1],
                id: matchLocal[2]
            };
        } else {
            return {
                uri
            };
        }
    }
    constructor(){}
};

//# sourceMappingURL=db-resolver.js.map
