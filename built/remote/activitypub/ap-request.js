"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createSignedPost: function() {
        return createSignedPost;
    },
    createSignedGet: function() {
        return createSignedGet;
    }
});
const _crypto = require("crypto");
function createSignedPost(args) {
    const u = new URL(args.url);
    const digestHeader = `SHA-256=${_crypto.createHash('sha256').update(args.body).digest('base64')}`;
    const request = {
        url: u.href,
        method: 'POST',
        headers: objectAssignWithLcKey({
            'Date': new Date().toUTCString(),
            'Host': u.hostname,
            'Content-Type': 'application/activity+json',
            'Digest': digestHeader
        }, args.additionalHeaders)
    };
    const result = signToRequest(request, args.key, [
        '(request-target)',
        'date',
        'host',
        'digest'
    ]);
    return {
        request,
        signingString: result.signingString,
        signature: result.signature,
        signatureHeader: result.signatureHeader
    };
}
function createSignedGet(args) {
    const u = new URL(args.url);
    const request = {
        url: u.href,
        method: 'GET',
        headers: objectAssignWithLcKey({
            'Accept': 'application/activity+json, application/ld+json',
            'Date': new Date().toUTCString(),
            'Host': new URL(args.url).hostname
        }, args.additionalHeaders)
    };
    const result = signToRequest(request, args.key, [
        '(request-target)',
        'date',
        'host',
        'accept'
    ]);
    return {
        request,
        signingString: result.signingString,
        signature: result.signature,
        signatureHeader: result.signatureHeader
    };
}
function signToRequest(request, key, includeHeaders) {
    const signingString = genSigningString(request, includeHeaders);
    const signature = _crypto.sign('sha256', Buffer.from(signingString), key.privateKeyPem).toString('base64');
    const signatureHeader = `keyId="${key.keyId}",algorithm="rsa-sha256",headers="${includeHeaders.join(' ')}",signature="${signature}"`;
    request.headers = objectAssignWithLcKey(request.headers, {
        Signature: signatureHeader
    });
    return {
        request,
        signingString,
        signature,
        signatureHeader
    };
}
function genSigningString(request, includeHeaders) {
    request.headers = lcObjectKey(request.headers);
    const results = [];
    for (const key of includeHeaders.map((x)=>x.toLowerCase())){
        if (key === '(request-target)') {
            results.push(`(request-target): ${request.method.toLowerCase()} ${new URL(request.url).pathname}`);
        } else {
            results.push(`${key}: ${request.headers[key]}`);
        }
    }
    return results.join('\n');
}
function lcObjectKey(src) {
    const dst = {};
    for (const key of Object.keys(src).filter((x)=>x != '__proto__' && typeof src[x] === 'string'))dst[key.toLowerCase()] = src[key];
    return dst;
}
function objectAssignWithLcKey(a, b) {
    return Object.assign(lcObjectKey(a), lcObjectKey(b));
}

//# sourceMappingURL=ap-request.js.map
