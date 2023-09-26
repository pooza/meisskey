"use strict";
Object.defineProperty(exports, "getJSONFeed", {
    enumerable: true,
    get: function() {
        return getJSONFeed;
    }
});
const _config = require("../../../config");
const _note = require("../../../models/note");
const _user = require("../../../models/user");
const _getdrivefileurl = require("../../../misc/get-drive-file-url");
const _cafyid = require("../../../misc/cafy-id");
const _getnotehtml = require("../../../remote/activitypub/misc/get-note-html");
const _parse = require("../../../misc/acct/parse");
async function getJSONFeed(acct, untilId) {
    const { username, host } = (0, _parse.default)(acct);
    const user = await _user.default.findOne({
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        usernameLower: username.toLowerCase(),
        host
    });
    if (user == null) return null;
    const query = {
        userId: user._id,
        deletedAt: null,
        visibility: {
            $in: [
                'public',
                'home'
            ]
        },
        text: {
            $ne: null
        }
    };
    if (untilId) {
        query._id = {
            $lt: (0, _cafyid.transform)(untilId)
        };
    }
    const notes = await _note.default.find(query, {
        sort: {
            _id: -1
        },
        limit: 20
    });
    const url = `${_config.default.url}/@${user.username}`;
    const name = user.name || user.username;
    const fullacct = `@${user.username}@${_config.default.host}`;
    const avatar = user.avatarUrl ? user.avatarUrl : undefined;
    const feed = {
        version: 'https://jsonfeed.org/version/1',
        title: `${name} (${fullacct})`,
        home_page_url: url,
        feed_url: `${url}.json`,
        next_url: notes.length > 0 ? `${url}.json?until_id=${notes[notes.length - 1]._id}` : undefined,
        description: user.description,
        icon: avatar,
        author: {
            name,
            url,
            avatar: avatar
        }
    };
    feed.items = [];
    for (const note of notes){
        const noteUrl = `${_config.default.url}/notes/${note._id}`;
        const image = note._files && note._files.find((file)=>file.contentType.startsWith('image/'));
        const item = {
            id: noteUrl,
            url: noteUrl,
            title: `New post by ${name}`,
            content_html: note.text != null ? (0, _getnotehtml.getNoteHtml)(note) : undefined,
            content_text: note.text != null ? note.text : undefined,
            summary: note.cw != null ? note.cw : undefined,
            image: image ? (0, _getdrivefileurl.default)(image) : undefined,
            date_published: note.createdAt ? note.createdAt.toISOString() : undefined,
            tags: note.tags && note.tags.length > 0 ? note.tags : undefined
        };
        if (note._files && note._files.length > 0) {
            item.attachments = note._files.map((file)=>{
                return {
                    url: (0, _getdrivefileurl.default)(file),
                    mime_type: file.contentType,
                    size_in_bytes: file.length,
                    title: file.filename
                };
            });
        }
        feed.items.push(item);
    }
    return feed;
}

//# sourceMappingURL=json.js.map
