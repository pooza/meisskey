"use strict";
Object.defineProperty(exports, "getRSSFeed", {
    enumerable: true,
    get: function() {
        return getRSSFeed;
    }
});
const _json = require("./json");
const _util = require("./util");
async function getRSSFeed(acct, untilId) {
    const json = await (0, _json.getJSONFeed)(acct, untilId);
    if (!json) return null;
    const root = {
        rss: {
            '@version': '2.0',
            '@xmlns:atom': 'http://www.w3.org/2005/Atom',
            '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
            '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
            channel: {
                'atom:link': {
                    '@href': json.feed_url.replace(/\.json$/, '.atom'),
                    '@rel': 'self',
                    '@type': 'application/rss+xml'
                },
                title: json.title,
                link: json.home_page_url,
                description: json.description,
                pubDate: new Date().toUTCString(),
                generator: 'Misskey',
                image: {
                    url: json.icon,
                    link: json.home_page_url,
                    title: json.title
                }
            }
        }
    };
    if (json.items) {
        root.rss.channel.item = [];
        for (const item of json.items){
            const entry = {
                title: item.title,
                link: item.url,
                'dc:creator': item.author ? item.author.name : json.author ? json.author.name : undefined,
                description: item.content_text,
                'content:encoded': {
                    '#cdata': item.content_html
                },
                category: item.tags,
                guid: {
                    '#text': item.id
                },
                pubDate: item.date_published ? new Date(item.date_published).toUTCString() : undefined
            };
            if (item.attachments) {
                entry.enclosure = item.attachments.map((attach)=>{
                    return {
                        '@url': attach.url,
                        '@type': attach.mime_type,
                        '@length': attach.size_in_bytes ? attach.size_in_bytes : 0
                    };
                });
            }
            root.rss.channel.item.push(entry);
        }
    }
    return (0, _util.objectToXml)(root);
}

//# sourceMappingURL=rss.js.map
