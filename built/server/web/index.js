/**
 * Web Client Server
 */ "use strict";
Object.defineProperty(exports, "genCsp", {
    enumerable: true,
    get: function() {
        return genCsp;
    }
});
const _koa = require("koa");
const _router = require("@koa/router");
const _koasend = require("koa-send");
const _koafavicon = require("koa-favicon");
const _koaviews = require("koa-views");
const _mongodb = require("mongodb");
const _docs = require("./docs");
const _user = require("../../models/user");
const _parse = require("../../misc/acct/parse");
const _config = require("../../config");
const _note = require("../../models/note");
const _getnotesummary = require("../../misc/get-note-summary");
const _fetchmeta = require("../../misc/fetch-meta");
const _emoji = require("../../models/emoji");
const _genspec = require("../api/openapi/gen-spec");
const _atom = require("./feed/atom");
const _rss = require("./feed/rss");
const _json = require("./feed/json");
const _buildmeta = require("../../misc/build-meta");
const _page = require("../../models/page");
const _fromhtml = require("../../mfm/from-html");
const ms = require("ms");
const htmlescape = require('htmlescape');
const staticAssets = `${__dirname}/../../../assets/`;
const client = `${__dirname}/../../client/`;
function genCsp() {
    const csp = `base-uri 'none'; ` + `default-src 'none'; ` + `script-src 'self' https://www.recaptcha.net/recaptcha/ https://www.gstatic.com/recaptcha/; ` + `img-src 'self' https: data: blob:; ` + `media-src 'self' https:; ` + `style-src 'self' 'unsafe-inline'; ` + `font-src 'self'; ` + `frame-src 'self' https:; ` + `manifest-src 'self'; ` + `connect-src 'self' data: blob: ${_config.default.wsUrl} https://api.rss2json.com; ` // wssを指定しないとSafariで動かない https://github.com/w3c/webappsec-csp/issues/7#issuecomment-1086257826
     + `frame-ancestors 'none'`;
    return {
        csp
    };
}
// Init app
const app = new _koa();
// Init renderer
app.use(_koaviews(__dirname + '/views', {
    extension: 'pug',
    options: {
        config: _config.default
    }
}));
// Serve favicon
app.use(_koafavicon(`${client}/assets/favicon.ico`));
// Init router
const router = new _router();
//#region static assets
router.get('/static-assets/*', async (ctx)=>{
    await _koasend(ctx, ctx.path.replace('/static-assets/', ''), {
        root: staticAssets,
        maxage: ms('7 days')
    });
});
router.get('/assets/*', async (ctx)=>{
    await _koasend(ctx, ctx.path, {
        root: client,
        maxage: ctx.path === 'boot.js' ? ms('5m') : ms('7 days')
    });
});
// Apple touch icon
router.get('/apple-touch-icon.png', async (ctx)=>{
    await _koasend(ctx, '/assets/apple-touch-icon.png', {
        root: client,
        maxage: ms('7 days')
    });
});
router.get('/twemoji/*', async (ctx)=>{
    const path = ctx.path.replace('/twemoji/', '');
    if (!path.match(/^[0-9a-f-]+\.svg$/)) {
        ctx.status = 404;
        return;
    }
    ctx.set('Content-Security-Policy', `default-src 'none'; style-src 'unsafe-inline'`);
    await _koasend(ctx, path, {
        root: `${__dirname}/../../../node_modules/memoji/dist/svg/`,
        maxage: ms('7 days')
    });
});
// ServiceWorker
router.get(/^\/sw\.(.+?)\.js$/, async (ctx)=>{
    await _koasend(ctx, `/assets/sw.${ctx.params[0]}.js`, {
        root: client
    });
});
// Manifest
router.get('/manifest.json', require('./manifest'));
router.get('/robots.txt', async (ctx)=>{
    await _koasend(ctx, '/assets/robots.txt', {
        root: client
    });
});
//#endregion
// Docs
router.use('/docs', _docs.default.routes());
router.get('/api-doc', async (ctx)=>{
    const { csp } = genCsp();
    await ctx.render('redoc', {
        version: _config.default.version
    });
    ctx.set('Content-Security-Policy', csp);
    ctx.set('Cache-Control', 'public, max-age=60');
});
// URL preview endpoint
router.get('/url', require('./url-preview'));
router.get('/api.json', async (ctx)=>{
    ctx.body = (0, _genspec.genOpenapiSpec)();
});
// Atom
router.get('/@:user.atom', async (ctx)=>{
    const feed = await (0, _atom.getAtomFeed)(ctx.params.user, ctx.query.until_id);
    if (feed) {
        ctx.set('Content-Type', 'application/atom+xml; charset=utf-8');
        ctx.body = feed;
    } else {
        ctx.status = 404;
    }
});
// RSS
router.get('/@:user.rss', async (ctx)=>{
    const feed = await (0, _rss.getRSSFeed)(ctx.params.user, ctx.query.until_id);
    if (feed) {
        ctx.set('Content-Type', 'application/rss+xml; charset=utf-8');
        ctx.body = feed;
    } else {
        ctx.status = 404;
    }
});
// JSON
router.get('/@:user.json', async (ctx)=>{
    const feed = await (0, _json.getJSONFeed)(ctx.params.user, ctx.query.until_id);
    if (feed) {
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.body = JSON.stringify(feed, null, 2);
    } else {
        ctx.status = 404;
    }
});
//#region for crawlers
// User
router.get([
    '/@:user',
    '/@:user/:sub'
], async (ctx, next)=>{
    const { username, host } = (0, _parse.default)(ctx.params.user);
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
    if (user == null || user.isDeleted) {
        ctx.status = 404;
    } else if (user.isSuspended || user.host) {
        // サスペンドユーザーのogは出さないがAPI経由でモデレータが閲覧できるように
        await next();
    } else {
        var _config_icons_favicon, _config_icons, _config_icons_favicon1, _config_icons1, _config_icons_appleTouchIcon, _config_icons2;
        const meta = await (0, _fetchmeta.default)();
        const builded = await (0, _buildmeta.buildMeta)(meta, false);
        const me = user.fields ? user.fields.filter((filed)=>filed.value != null && filed.value.match(/^https?:/)).map((field)=>field.value) : [];
        const { csp } = genCsp();
        await ctx.render('user', {
            version: _config.default.version,
            initialMeta: htmlescape(builded),
            user,
            me,
            sub: ctx.params.sub,
            instanceName: meta.name,
            icon: (_config_icons = _config.default.icons) === null || _config_icons === void 0 ? void 0 : (_config_icons_favicon = _config_icons.favicon) === null || _config_icons_favicon === void 0 ? void 0 : _config_icons_favicon.url,
            iconType: (_config_icons1 = _config.default.icons) === null || _config_icons1 === void 0 ? void 0 : (_config_icons_favicon1 = _config_icons1.favicon) === null || _config_icons_favicon1 === void 0 ? void 0 : _config_icons_favicon1.type,
            appleTouchIcon: (_config_icons2 = _config.default.icons) === null || _config_icons2 === void 0 ? void 0 : (_config_icons_appleTouchIcon = _config_icons2.appleTouchIcon) === null || _config_icons_appleTouchIcon === void 0 ? void 0 : _config_icons_appleTouchIcon.url,
            noindex: user.host || user.avoidSearchIndex
        });
        ctx.set('Content-Security-Policy', csp);
        ctx.set('Cache-Control', 'public, max-age=60');
    }
});
router.get('/users/:user', async (ctx)=>{
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    const user = await _user.default.findOne({
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        _id: userId,
        host: null
    });
    if (user == null) {
        ctx.status = 404;
        return;
    }
    ctx.redirect(`/@${user.username}${user.host == null ? '' : '@' + user.host}`);
});
// Note
router.get('/notes/:note', async (ctx, next)=>{
    var _note1, _note_user, _note2, _video, _image, _video1, _audio, _video2, _audio1, _note3, _config_icons_favicon, _config_icons, _config_icons_favicon1, _config_icons1, _config_icons_appleTouchIcon, _config_icons2, _note_user1;
    if (!_mongodb.ObjectID.isValid(ctx.params.note)) {
        ctx.status = 404;
        return;
    }
    const note = await _note.default.findOne({
        _id: ctx.params.note
    });
    if (!note) {
        ctx.status = 404;
        return;
    }
    const _note4 = await (0, _note.pack)(note);
    if (!_note4) {
        ctx.status = 404;
        return;
    }
    if (((_note1 = _note4) === null || _note1 === void 0 ? void 0 : _note1.isHidden) || ((_note2 = _note4) === null || _note2 === void 0 ? void 0 : (_note_user = _note2.user) === null || _note_user === void 0 ? void 0 : _note_user.host) || ![
        'public',
        'home'
    ].includes(note.visibility)) {
        await next(); // no og
        return;
    }
    const meta = await (0, _fetchmeta.default)();
    const builded = await (0, _buildmeta.buildMeta)(meta, false);
    const video = _note4.files.filter((file)=>file.type.match(/^video/) && !file.isSensitive).shift();
    const audio = _note4.files.filter((file)=>file.type.match(/^audio/) && !file.isSensitive).shift();
    const image = _note4.files.filter((file)=>file.type.match(/^image/) && !file.isSensitive).shift();
    let imageUrl = ((_video = video) === null || _video === void 0 ? void 0 : _video.thumbnailUrl) || ((_image = image) === null || _image === void 0 ? void 0 : _image.thumbnailUrl);
    // or avatar
    if (imageUrl == null || imageUrl === '') {
        var _note_user2;
        imageUrl = (_note_user2 = _note4.user) === null || _note_user2 === void 0 ? void 0 : _note_user2.avatarUrl;
    }
    const stream = ((_video1 = video) === null || _video1 === void 0 ? void 0 : _video1.url) || ((_audio = audio) === null || _audio === void 0 ? void 0 : _audio.url);
    const type = ((_video2 = video) === null || _video2 === void 0 ? void 0 : _video2.type) || ((_audio1 = audio) === null || _audio1 === void 0 ? void 0 : _audio1.type);
    const player = video || audio ? `${_config.default.url}/notes/${(_note3 = _note4) === null || _note3 === void 0 ? void 0 : _note3.id}/embed` : null;
    const width = 530; // TODO: thumbnail width
    const height = 255;
    const { csp } = genCsp();
    await ctx.render('note', {
        version: _config.default.version,
        initialMeta: htmlescape(builded),
        note: _note4,
        summary: (0, _getnotesummary.default)(_note4),
        imageUrl,
        instanceName: meta.name,
        icon: (_config_icons = _config.default.icons) === null || _config_icons === void 0 ? void 0 : (_config_icons_favicon = _config_icons.favicon) === null || _config_icons_favicon === void 0 ? void 0 : _config_icons_favicon.url,
        iconType: (_config_icons1 = _config.default.icons) === null || _config_icons1 === void 0 ? void 0 : (_config_icons_favicon1 = _config_icons1.favicon) === null || _config_icons_favicon1 === void 0 ? void 0 : _config_icons_favicon1.type,
        appleTouchIcon: (_config_icons2 = _config.default.icons) === null || _config_icons2 === void 0 ? void 0 : (_config_icons_appleTouchIcon = _config_icons2.appleTouchIcon) === null || _config_icons_appleTouchIcon === void 0 ? void 0 : _config_icons_appleTouchIcon.url,
        noindex: (_note_user1 = _note4.user) === null || _note_user1 === void 0 ? void 0 : _note_user1.avoidSearchIndex,
        player,
        width,
        height,
        stream,
        type
    });
    ctx.set('Content-Security-Policy', csp);
    ctx.set('Cache-Control', 'public, max-age=60');
    return;
});
router.get('/notes/:note/embed', async (ctx)=>{
    ctx.remove('X-Frame-Options');
    if (_mongodb.ObjectID.isValid(ctx.params.note)) {
        const note = await _note.default.findOne({
            _id: ctx.params.note
        });
        if (note) {
            var _video, _audio, _this;
            const _note1 = await (0, _note.pack)(note);
            const video = _note1.files.filter((file)=>file.type.match(/^video/) && !file.isSensitive).shift();
            const audio = video ? undefined : _note1.files.filter((file)=>file.type.match(/^audio/) && !file.isSensitive).shift();
            const { csp } = genCsp();
            await ctx.render('note-embed', {
                video: (_video = video) === null || _video === void 0 ? void 0 : _video.url,
                audio: (_audio = audio) === null || _audio === void 0 ? void 0 : _audio.url,
                type: (_this = video || audio) === null || _this === void 0 ? void 0 : _this.type,
                autoplay: ctx.query.autoplay != null
            });
            ctx.set('Content-Security-Policy', csp);
            // nounceは使わないのでキャッシュは許容
            if ([
                'public',
                'home'
            ].includes(note.visibility)) {
                ctx.set('Cache-Control', 'public, max-age=180');
            } else {
                ctx.set('Cache-Control', 'private, max-age=0, must-revalidate');
            }
            return;
        }
    }
    ctx.status = 404;
});
//#endregion
// Page
router.get('/@:user/pages/:page', async (ctx)=>{
    const { username, host } = (0, _parse.default)(ctx.params.user);
    const user = await _user.default.findOne({
        usernameLower: username.toLowerCase(),
        host
    });
    if (user == null) return;
    const page = await _page.default.findOne({
        name: ctx.params.page,
        userId: user._id
    });
    if (page) {
        var _config_icons_favicon, _config_icons, _config_icons_favicon1, _config_icons1, _config_icons_appleTouchIcon, _config_icons2;
        const _page1 = await (0, _page.packPage)(page, user._id);
        const meta = await (0, _fetchmeta.default)();
        const builded = await (0, _buildmeta.buildMeta)(meta, false);
        const { csp } = genCsp();
        await ctx.render('page', {
            version: _config.default.version,
            initialMeta: htmlescape(builded),
            page: _page1,
            instanceName: meta.name || 'Misskey',
            icon: (_config_icons = _config.default.icons) === null || _config_icons === void 0 ? void 0 : (_config_icons_favicon = _config_icons.favicon) === null || _config_icons_favicon === void 0 ? void 0 : _config_icons_favicon.url,
            iconType: (_config_icons1 = _config.default.icons) === null || _config_icons1 === void 0 ? void 0 : (_config_icons_favicon1 = _config_icons1.favicon) === null || _config_icons_favicon1 === void 0 ? void 0 : _config_icons_favicon1.type,
            appleTouchIcon: (_config_icons2 = _config.default.icons) === null || _config_icons2 === void 0 ? void 0 : (_config_icons_appleTouchIcon = _config_icons2.appleTouchIcon) === null || _config_icons_appleTouchIcon === void 0 ? void 0 : _config_icons_appleTouchIcon.url
        });
        ctx.set('Content-Security-Policy', csp);
        if ([
            'public'
        ].includes(page.visibility)) {
            ctx.set('Cache-Control', 'public, max-age=60');
        } else {
            ctx.set('Cache-Control', 'private, max-age=0, must-revalidate');
        }
        return;
    }
    ctx.status = 404;
});
router.get('/info', async (ctx)=>{
    const meta = await (0, _fetchmeta.default)();
    let desc = meta.description;
    try {
        desc = (0, _fromhtml.fromHtml)(desc || '') || undefined;
    } catch (e) {}
    const emojis = await _emoji.default.find({
        host: null
    }, {
        fields: {
            _id: false
        }
    });
    const { csp } = genCsp();
    await ctx.render('info', {
        version: _config.default.version,
        emojis: emojis,
        meta: meta,
        desc
    });
    ctx.set('Content-Security-Policy', csp);
});
const override = (source, target, depth = 0)=>[
        ,
        ...target.split('/').filter((x)=>x),
        ...source.split('/').filter((x)=>x).splice(depth)
    ].join('/');
router.get('/othello', async (ctx)=>ctx.redirect(override(ctx.URL.pathname, 'games/reversi', 1)));
router.get('/reversi', async (ctx)=>ctx.redirect(override(ctx.URL.pathname, 'games')));
router.get('/flush', async (ctx)=>{
    const { csp } = genCsp();
    await ctx.render('flush', {
        version: _config.default.version
    });
    ctx.set('Content-Security-Policy', csp);
});
// streamingに非WebSocketリクエストが来た場合にbase htmlをキャシュ付きで返すと、Proxy等でそのパスがキャッシュされておかしくなる
router.get('/streaming', async (ctx)=>{
    console.log(`UNEXPECTED_STREAMING_1 ${ctx.path}`);
    ctx.status = 503;
    ctx.set('Cache-Control', 'private, max-age=0');
});
// Render base html for all requests
router.get('*', async (ctx)=>{
    var _config_icons_favicon, _config_icons, _config_icons_favicon1, _config_icons1, _config_icons_appleTouchIcon, _config_icons2;
    // streamingに非WebSocketリクエストが来た場合 (v9以前のEPのうちの != /)
    if (ctx.path === '/local-timeline' || ctx.path === '/global-timeline' || ctx.path === '/hybrid-timeline') {
        console.log(`UNEXPECTED_STREAMING_2 ${ctx.path}`);
        ctx.status = 503;
        ctx.set('Cache-Control', 'private, max-age=0');
        return;
    }
    const meta = await (0, _fetchmeta.default)();
    const builded = await (0, _buildmeta.buildMeta)(meta, false);
    let desc = meta.description;
    try {
        desc = (0, _fromhtml.fromHtml)(desc || '') || undefined;
    } catch (e) {}
    const noindex = ctx.path.match(/^[/](search|tags[/]|explore|featured)/);
    const { csp } = genCsp();
    await ctx.render('base', {
        version: _config.default.version,
        initialMeta: htmlescape(builded),
        img: meta.bannerUrl,
        title: meta.name || 'Misskey',
        instanceName: meta.name || 'Misskey',
        desc,
        icon: (_config_icons = _config.default.icons) === null || _config_icons === void 0 ? void 0 : (_config_icons_favicon = _config_icons.favicon) === null || _config_icons_favicon === void 0 ? void 0 : _config_icons_favicon.url,
        iconType: (_config_icons1 = _config.default.icons) === null || _config_icons1 === void 0 ? void 0 : (_config_icons_favicon1 = _config_icons1.favicon) === null || _config_icons_favicon1 === void 0 ? void 0 : _config_icons_favicon1.type,
        appleTouchIcon: (_config_icons2 = _config.default.icons) === null || _config_icons2 === void 0 ? void 0 : (_config_icons_appleTouchIcon = _config_icons2.appleTouchIcon) === null || _config_icons_appleTouchIcon === void 0 ? void 0 : _config_icons_appleTouchIcon.url,
        noindex
    });
    ctx.set('Content-Security-Policy', csp);
    if (process.env.NODE_ENV === 'production') {
        ctx.set('Cache-Control', 'public, max-age=60');
    } else {
        ctx.set('Cache-Control', 'private, max-age=0, must-revalidate');
    }
});
// Register router
app.use(router.routes());
module.exports = app;

//# sourceMappingURL=index.js.map
