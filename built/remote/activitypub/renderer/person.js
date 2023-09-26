"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _image = require("./image");
const _key = require("./key");
const _config = require("../../../config");
const _tohtml = require("../../../mfm/to-html");
const _parse = require("../../../mfm/parse");
const _drivefile = require("../../../models/drive-file");
const _note = require("./note");
const _emoji = require("./emoji");
const _hashtag = require("./hashtag");
const _default = async (user)=>{
    var _user_profile, _user_profile1;
    const isSystem = !!user.username.match(/\./);
    const id = `${_config.default.url}/users/${user._id}`;
    const [avatar, banner] = await Promise.all([
        _drivefile.default.findOne({
            _id: user.avatarId
        }),
        _drivefile.default.findOne({
            _id: user.bannerId
        })
    ]);
    const attachment = [];
    if (user.fields) {
        for (const field of user.fields){
            attachment.push({
                type: 'PropertyValue',
                name: field.name,
                value: field.value != null && field.value.match(/^https?:/) ? `<a href="${new URL(field.value).href}" rel="me nofollow noopener" target="_blank">${new URL(field.value).href}</a>` : field.value
            });
        }
    }
    if (user.twitter) {
        attachment.push({
            type: 'PropertyValue',
            name: 'Twitter',
            value: `<a href="https://twitter.com/intent/user?user_id=${user.twitter.userId}" rel="me nofollow noopener" target="_blank"><span>@${user.twitter.screenName}</span></a>`,
            identifier: {
                type: 'PropertyValue',
                name: 'misskey:authentication:twitter',
                value: `${user.twitter.userId}@${user.twitter.screenName}`
            }
        });
    }
    if (user.github) {
        attachment.push({
            type: 'PropertyValue',
            name: 'GitHub',
            value: `<a href="https://github.com/${user.github.login}" rel="me nofollow noopener" target="_blank"><span>@${user.github.login}</span></a>`,
            identifier: {
                type: 'PropertyValue',
                name: 'misskey:authentication:github',
                value: `${user.github.id}@${user.github.login}`
            }
        });
    }
    if (user.discord) {
        attachment.push({
            type: 'PropertyValue',
            name: 'Discord',
            value: `<a href="https://discord.com/users/${user.discord.id}" rel="me nofollow noopener" target="_blank"><span>${user.discord.username}#${user.discord.discriminator}</span></a>`,
            identifier: {
                type: 'PropertyValue',
                name: 'misskey:authentication:discord',
                value: `${user.discord.id}@${user.discord.username}#${user.discord.discriminator}`
            }
        });
    }
    const emojis = await (0, _note.getEmojis)(user.emojis);
    const apemojis = emojis.map((emoji)=>(0, _emoji.default)(emoji));
    const hashtagTags = (user.tags || []).map((tag)=>(0, _hashtag.default)(tag));
    const tag = [
        ...apemojis,
        ...hashtagTags
    ];
    var _user_description;
    const person = {
        type: isSystem ? 'Application' : user.isBot ? 'Service' : 'Person',
        id,
        inbox: `${id}/inbox`,
        outbox: `${id}/outbox`,
        followers: `${id}/followers`,
        following: `${id}/following`,
        featured: `${id}/collections/featured`,
        sharedInbox: `${_config.default.url}/inbox`,
        endpoints: {
            sharedInbox: `${_config.default.url}/inbox`
        },
        url: `${_config.default.url}/@${user.username}`,
        preferredUsername: user.username,
        name: user.name,
        summary: (0, _tohtml.toHtml)((0, _parse.parseFull)((_user_description = user.description) !== null && _user_description !== void 0 ? _user_description : '')),
        icon: avatar && (0, _image.default)(avatar),
        image: banner && (0, _image.default)(banner),
        tag,
        manuallyApprovesFollowers: user.isLocked || user.carefulRemote,
        discoverable: !!user.isExplorable,
        searchableBy: user.searchableBy === 'none' ? [] : [
            'https://www.w3.org/ns/activitystreams#Public'
        ],
        publicKey: (0, _key.default)(user, `#main-key`),
        isCat: user.isCat,
        attachment: attachment.length ? attachment : undefined
    };
    if ((_user_profile = user.profile) === null || _user_profile === void 0 ? void 0 : _user_profile.birthday) {
        person['vcard:bday'] = user.profile.birthday;
    }
    if ((_user_profile1 = user.profile) === null || _user_profile1 === void 0 ? void 0 : _user_profile1.location) {
        person['vcard:Address'] = user.profile.location;
    }
    return person;
};

//# sourceMappingURL=person.js.map
