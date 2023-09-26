"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Resolver;
    }
});
const _fetch = require("../../misc/fetch");
const _type = require("./type");
const _instanceactor = require("../../services/instance-actor");
const _request = require("./request");
const _config = require("../../config");
const _converthost = require("../../misc/convert-host");
const _instancemoderation = require("../../services/instance-moderation");
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
let Resolver = class Resolver {
    getHistory() {
        return Array.from(this.history);
    }
    async resolveCollection(value) {
        const collection = typeof value === 'string' ? await this.resolve(value) : value;
        if ((0, _type.isCollection)(collection) || (0, _type.isOrderedCollection)(collection) || (0, _type.isCollectionPage)(collection) || (0, _type.isOrderedCollectionPage)(collection)) {
            return collection;
        } else {
            throw new Error(`unknown collection type: ${collection.type}`);
        }
    }
    async resolve(value) {
        if (value == null) {
            throw new Error('resolvee is null (or undefined)');
        }
        if (typeof value !== 'string') {
            return value;
        }
        if (this.history.has(value)) {
            throw new Error('cannot resolve already resolved one');
        }
        if (this.recursionLimit && this.history.size > this.recursionLimit) {
            throw new Error('hit recursion limit');
        }
        this.history.add(value);
        if (!value.match(/^https?:/)) {
            throw new _fetch.StatusError('Bad protocol', 400, 'Bad protocol');
        }
        const host = (0, _converthost.extractApHost)(value);
        // ブロックしてたら中断
        if (await (0, _instancemoderation.isBlockedHost)(host)) {
            throw new _fetch.StatusError('Blocked instance', 451, 'Blocked instance');
        }
        if (_config.default.signToActivityPubGet !== false && !this.user) {
            this.user = await (0, _instanceactor.getInstanceActor)();
        }
        const object = this.user ? await (0, _request.signedGet)(value, this.user) : await (0, _fetch.getJson)(value, 'application/activity+json, application/ld+json');
        if (object === null || (Array.isArray(object['@context']) ? !object['@context'].includes('https://www.w3.org/ns/activitystreams') : object['@context'] !== 'https://www.w3.org/ns/activitystreams')) {
            throw {
                name: `InvalidResponse`,
                statusCode: 482,
                message: `Invalid @context`
            };
        }
        return object;
    }
    constructor(recursionLimit = 200){
        _define_property(this, "history", void 0);
        _define_property(this, "user", void 0);
        _define_property(this, "recursionLimit", void 0);
        this.history = new Set();
        this.recursionLimit = recursionLimit;
    }
};

//# sourceMappingURL=resolver.js.map
