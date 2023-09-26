"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    randomBytesAsync: function() {
        return randomBytesAsync;
    },
    LdSignature: function() {
        return LdSignature;
    }
});
const _crypto = require("crypto");
const _util = require("util");
const _jsonld = require("jsonld");
const _contexts = require("./contexts");
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
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const randomBytesAsync = _util.promisify(_crypto.randomBytes);
function isRsaSignature2017(signature) {
    var _signature;
    return ((_signature = signature) === null || _signature === void 0 ? void 0 : _signature.type) === 'RsaSignature2017';
}
let LdSignature = class LdSignature {
    async signRsaSignature2017(data, privateKeyPem, creator, domain, created) {
        const options = {
            type: 'RsaSignature2017',
            creator,
            domain,
            nonce: (await randomBytesAsync(16)).toString('hex'),
            created: (created || new Date()).toISOString()
        };
        if (!domain) {
            delete options.domain;
        }
        const privateKey = _crypto.createPrivateKey(privateKeyPem);
        if (privateKey.asymmetricKeyType !== 'rsa') throw new Error('privateKey is not rsa');
        const toBeSigned = await this.createVerifyData(data, options);
        const signature = _crypto.sign('sha256', Buffer.from(toBeSigned), privateKey);
        return _object_spread_props(_object_spread({}, data), {
            signature: _object_spread_props(_object_spread({}, options), {
                signatureValue: signature.toString('base64')
            })
        });
    }
    async verifyRsaSignature2017(data, publicKeyPem) {
        const signature = data.signature;
        if (!isRsaSignature2017(signature)) throw new Error('signature is not RsaSignature2017');
        const publicKey = _crypto.createPublicKey(publicKeyPem);
        if (publicKey.asymmetricKeyType !== 'rsa') throw new Error('publicKey is not rsa');
        const toBeSigned = await this.createVerifyData(data, signature);
        return _crypto.verify('sha256', Buffer.from(toBeSigned), publicKey, Buffer.from(signature.signatureValue, 'base64'));
    }
    async createVerifyData(data, options) {
        const transformedOptions = _object_spread_props(_object_spread({}, options), {
            '@context': 'https://w3id.org/identity/v1'
        });
        delete transformedOptions['type'];
        delete transformedOptions['id'];
        delete transformedOptions['signatureValue'];
        const canonizedOptions = await this.normalize(transformedOptions);
        const optionsHash = this.sha256(canonizedOptions);
        const transformedData = _object_spread({}, data);
        delete transformedData['signature'];
        const cannonidedData = await this.normalize(transformedData);
        const documentHash = this.sha256(cannonidedData);
        const verifyData = `${optionsHash}${documentHash}`;
        return verifyData;
    }
    async normalize(data) {
        const customLoader = this.getLoader();
        return await _jsonld.normalize(data, {
            algorithm: 'URDNA2015',
            documentLoader: customLoader
        });
    }
    getLoader() {
        return async (url)=>{
            if (!url.match('^https?\:\/\/')) throw `Invalid URL ${url}`;
            if (this.preLoad) {
                if (url in _contexts.CONTEXTS) {
                    if (this.debug) console.debug(`PRELOADED: ${url}`);
                    return {
                        contextUrl: null,
                        document: _contexts.CONTEXTS[url],
                        documentUrl: url
                    };
                }
            }
            if (!this.fetchFunc) {
                if (this.debug) console.debug(`REJECT: ${url}`);
                throw `REJECT: ${url}`;
            }
            if (this.debug) console.debug(`FETCH: ${url}`);
            const document = await this.fetchFunc(url);
            return {
                contextUrl: null,
                document: document,
                documentUrl: url
            };
        };
    }
    sha256(data) {
        const hash = _crypto.createHash('sha256');
        hash.update(data);
        return hash.digest('hex').toLowerCase();
    }
    constructor(){
        _define_property(this, "debug", false);
        _define_property(this, "preLoad", true);
        _define_property(this, "fetchFunc", void 0);
    }
};

//# sourceMappingURL=ld-signature.js.map
