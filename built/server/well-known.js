"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _mongodb = require("mongodb");
const _router = require("@koa/router");
const _config = require("../config");
const _parse = require("../misc/acct/parse");
const _user = require("../models/user");
const _nodeinfo = require("./nodeinfo");
const _xml = require("../prelude/xml");
// Init router
const router = new _router();
const XRD = (...x)=>`<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">${x.map(({ element, value, attributes })=>`<${Object.entries(typeof attributes === 'object' && attributes || {}).reduce((a, [k, v])=>`${a} ${k}="${(0, _xml.escapeAttribute)(v)}"`, element)}${typeof value === 'string' ? `>${(0, _xml.escapeValue)(value)}</${element}` : '/'}>`).reduce((a, c)=>a + c, '')}</XRD>`;
const webFingerPath = '/.well-known/webfinger';
const jrd = 'application/jrd+json';
const xrd = 'application/xrd+xml';
router.get('/.well-known/host-meta', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    ctx.set('Content-Type', xrd);
    ctx.body = XRD({
        element: 'Link',
        attributes: {
            rel: 'lrdd',
            type: xrd,
            template: `${_config.default.url}${webFingerPath}?resource={uri}`
        }
    });
});
router.get('/.well-known/host-meta.json', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    ctx.set('Content-Type', jrd);
    ctx.body = {
        links: [
            {
                rel: 'lrdd',
                type: jrd,
                template: `${_config.default.url}${webFingerPath}?resource={uri}`
            }
        ]
    };
});
router.get('/.well-known/nodeinfo', async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    ctx.body = {
        links: _nodeinfo.links
    };
});
router.get(webFingerPath, async (ctx)=>{
    const generateQuery = (resource)=>resource.startsWith(`${_config.default.url.toLowerCase()}/users/`) ? fromId(new _mongodb.ObjectID(resource.split('/').pop())) : fromAcct((0, _parse.default)(resource.startsWith(`${_config.default.url.toLowerCase()}/@`) ? resource.split('/').pop() : resource.startsWith('acct:') ? resource.slice('acct:'.length) : resource));
    const fromId = (_id)=>({
            _id,
            isDeleted: {
                $ne: true
            },
            isSuspended: {
                $ne: true
            },
            noFederation: {
                $ne: true
            },
            host: null
        });
    const fromAcct = (acct)=>!acct.host || acct.host === _config.default.host.toLowerCase() ? {
            usernameLower: acct.username,
            isDeleted: {
                $ne: true
            },
            isSuspended: {
                $ne: true
            },
            noFederation: {
                $ne: true
            },
            host: null
        } : 422;
    if (typeof ctx.query.resource !== 'string') {
        ctx.status = 400;
        return;
    }
    const query = generateQuery(ctx.query.resource.toLowerCase());
    if (typeof query === 'number') {
        ctx.status = query;
        return;
    }
    const user = await _user.default.findOne(query);
    if (user == null) {
        ctx.status = 404;
        return;
    }
    const subject = `acct:${user.username}@${_config.default.host}`;
    const self = {
        rel: 'self',
        type: 'application/activity+json',
        href: `${_config.default.url}/users/${user._id}`
    };
    const profilePage = {
        rel: 'http://webfinger.net/rel/profile-page',
        type: 'text/html',
        href: `${_config.default.url}/@${user.username}`
    };
    const subscribe = {
        rel: 'http://ostatus.org/schema/1.0/subscribe',
        template: `${_config.default.url}/authorize-follow?acct={uri}`
    };
    if (ctx.accepts(jrd, xrd) === xrd) {
        ctx.body = XRD({
            element: 'Subject',
            value: subject
        }, {
            element: 'Link',
            attributes: self
        }, {
            element: 'Link',
            attributes: profilePage
        }, {
            element: 'Link',
            attributes: subscribe
        });
        ctx.type = xrd;
    } else {
        ctx.body = {
            subject,
            links: [
                self,
                profilePage,
                subscribe
            ]
        };
        ctx.type = jrd;
    }
    ctx.vary('Accept');
    ctx.set('Cache-Control', 'public, max-age=180');
});
// Return 404 for other .well-known
router.all('/.well-known/*', async (ctx)=>{
    ctx.status = 404;
});
const _default = router;

//# sourceMappingURL=well-known.js.map
