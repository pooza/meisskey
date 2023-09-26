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
const _app = require("../../../../models/app");
const _define = require("../../define");
const _array = require("../../../../prelude/array");
const _securerndstr = require("../../../../misc/secure-rndstr");
const meta = {
    tags: [
        'app'
    ],
    requireCredential: false,
    params: {
        name: {
            validator: _cafy.default.str
        },
        description: {
            validator: _cafy.default.str
        },
        permission: {
            validator: _cafy.default.arr(_cafy.default.str).unique()
        },
        // TODO: Check it is valid url
        callbackUrl: {
            validator: _cafy.default.optional.nullable.str,
            default: null
        }
    }
};
const _default = (0, _define.default)(meta, async (ps, user)=>{
    // Generate secret
    const secret = (0, _securerndstr.secureRndstr)(32, true);
    let p = ps.permission;
    /*
	p = p.map(x => x
		// v11 => v10
		.replace('read:account', 'account-read')
		.replace('write:account', 'account-write')
		.replace('read:drive', 'drive-read')
		.replace('write:drive', 'drive-write')
		.replace('read:favorites', 'favorite-read')
		.replace('write:favorites', 'favorite-write')
		.replace('read:following', 'following-read')
		.replace('write:following', 'following-write')
		.replace('read:messaging', 'messaging-read')
		.replace('write:messaging', 'messaging-write')
		.replace('write:notes', 'note-write')
		.replace('read:notifications', 'notification-read')
		.replace('write:notifications', 'notification-write')
		.replace('read:reactions', 'reaction-read')
		.replace('write:reactions', 'reaction-write')
		.replace('write:votes', 'vote-write')
	);
	*/ // v10 typos
    /*
	if (p.includes('favorites-read')) p.push('favorite-read');
	if (p.includes('favorite-read')) p.push('favorites-read');
	if (p.includes('account/read')) p.push('account-read');
	if (p.includes('account-read')) p.push('account/read');
	if (p.includes('account/write')) p.push('account-write');
	if (p.includes('account-write')) p.push('account/write');
	*/ // 今のv10にはなし
    // 'note-read', 'vote-read',
    // v11にしかない
    // 'read:blocks', 'write:blocks', 'read:mutes', 'write:mutes'
    // pages, groups
    p = (0, _array.unique)(p);
    // Create account
    const app = await _app.default.insert({
        createdAt: new Date(),
        userId: user && user._id,
        name: ps.name,
        description: ps.description,
        permission: p,
        callbackUrl: ps.callbackUrl,
        secret: secret
    });
    return await (0, _app.pack)(app, null, {
        detail: true,
        includeSecret: true
    });
});

//# sourceMappingURL=create.js.map
