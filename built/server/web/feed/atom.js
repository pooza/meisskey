"use strict";
Object.defineProperty(exports, "getAtomFeed", {
    enumerable: true,
    get: function() {
        return getAtomFeed;
    }
});
const _json = require("./json");
const _util = require("./util");
async function getAtomFeed(acct, untilId) {
    const json = await (0, _json.getJSONFeed)(acct, untilId);
    if (!json) return null;
    const root = {
        feed: {
            '@xmlns': 'http://www.w3.org/2005/Atom',
            title: json.title,
            id: json.feed_url,
            updated: new Date().toISOString(),
            author: json.author,
            generator: {
                '#text': 'Misskey'
            },
            description: json.description
        }
    };
    root.feed.link = [];
    root.feed.entry = [];
    // link - self / alts
    if (json.feed_url) {
        root.feed.link.push({
            '@rel': 'self',
            '@type': 'application/atom+xml',
            '@href': json.feed_url.replace(/\.json$/, '.atom')
        });
        root.feed.link.push({
            '@rel': 'alternate',
            '@type': 'application/json',
            '@href': json.feed_url
        });
        root.feed.link.push({
            '@rel': 'alternate',
            '@type': 'application/rss+xml',
            '@href': json.feed_url.replace(/\.json$/, '.rss')
        });
    }
    // link - html
    if (json.home_page_url) {
        root.feed.link.push({
            '@rel': 'alternate',
            '@type': 'text/html',
            '@href': json.home_page_url
        });
    }
    // link - next
    if (json.next_url) {
        root.feed.link.push({
            '@rel': 'next',
            '@type': 'application/atom+xml',
            '@href': json.next_url.replace(/\.json\?/, '.atom?')
        });
    }
    // items
    if (json.items) {
        for (const item of json.items){
            const entry = {
                id: item.id,
                title: item.title,
                published: item.date_published,
                updated: item.date_published,
                author: item.author,
                summary: item.summary
            };
            // item - content - html
            entry.content = [];
            if (item.content_html) {
                entry.content.push({
                    '@type': 'html',
                    '#cdata': item.content_html
                });
            }
            // item - content - text
            // Atomはcontentを2つ以上入れてはいけない
            if (item.content_text && !item.content_html) {
                entry.content.push({
                    '@type': 'text',
                    '#text': item.content_text
                });
            }
            entry.link = [];
            // item - link - pages
            if (item.url) {
                entry.link.push({
                    '@rel': 'alternate',
                    '@type': 'text/html',
                    '@href': item.url
                });
            }
            if (item.external_url) {
                entry.link.push({
                    '@rel': item.url ? 'related' : 'alternate',
                    '@type': 'text/html',
                    '@href': item.external_url
                });
            }
            // item - link - attachments
            if (item.attachments) {
                for (const attach of item.attachments){
                    entry.link.push({
                        '@rel': 'enclosure',
                        '@href': attach.url,
                        '@type': attach.mime_type,
                        '@length': attach.size_in_bytes ? attach.size_in_bytes : undefined
                    });
                }
            }
            // item - category
            if (item.tags) {
                entry.category = item.tags.map((tag)=>({
                        '@term': tag
                    }));
            }
            root.feed.entry.push(entry);
        }
    }
    return (0, _util.objectToXml)(root);
}

//# sourceMappingURL=atom.js.map
