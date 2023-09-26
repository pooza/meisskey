"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    renderActivity: function() {
        return renderActivity;
    },
    attachLdSignature: function() {
        return attachLdSignature;
    }
});
const _config = require("../../../config");
const _uuid = require("uuid");
const _ldsignature = require("../misc/ld-signature");
const renderActivity = (x)=>{
    if (x == null) return null;
    if (x !== null && typeof x === 'object' && x.id == null) {
        x.id = `${_config.default.url}/${(0, _uuid.v4)()}`;
    }
    return Object.assign({
        '@context': [
            'https://www.w3.org/ns/activitystreams',
            'https://w3id.org/security/v1',
            {
                // as non-standards
                manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
                sensitive: 'as:sensitive',
                Hashtag: 'as:Hashtag',
                // Mastodon
                toot: 'http://joinmastodon.org/ns#',
                Emoji: 'toot:Emoji',
                featured: 'toot:featured',
                discoverable: 'toot:discoverable',
                // schema
                schema: 'http://schema.org#',
                PropertyValue: 'schema:PropertyValue',
                value: 'schema:value',
                // Misskey
                misskey: 'https://misskey-hub.net/ns#',
                '_misskey_content': 'misskey:_misskey_content',
                '_misskey_quote': 'misskey:_misskey_quote',
                '_misskey_reaction': 'misskey:_misskey_reaction',
                '_misskey_votes': 'misskey:_misskey_votes',
                'isCat': 'misskey:isCat',
                // vcard
                vcard: 'http://www.w3.org/2006/vcard/ns#',
                // Fedibird
                fedibird: 'http://fedibird.com/ns#',
                quoteUri: 'fedibird:quoteUri',
                searchableBy: {
                    '@id': 'fedibird:searchableBy',
                    '@type': '@id'
                }
            }
        ]
    }, x);
};
const attachLdSignature = async (activity, user)=>{
    if (activity == null) return null;
    const ldSignature = new _ldsignature.LdSignature();
    ldSignature.debug = false;
    activity = await ldSignature.signRsaSignature2017(activity, user.keypair, `${_config.default.url}/users/${user._id}#main-key`);
    return activity;
};

//# sourceMappingURL=index.js.map
