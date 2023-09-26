/**
 * Docs
 */ "use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _fs = require("fs");
const _path = require("path");
const _showdown = require("showdown");
require("showdown-highlightjs-extension");
const _router = require("@koa/router");
const _koasend = require("koa-send");
const _glob = require("glob");
const _config = require("../../config");
const _constjson = require("../../const.json");
const _locales = require("../../../locales");
const _nestedproperty = require("nested-property");
const _ = require(".");
const ms = require("ms");
function getLang(lang) {
    if ([
        'en-US',
        'ja-JP'
    ].includes(lang)) {
        return lang;
    } else {
        return 'en-US';
    }
}
async function genVars(lang) {
    const vars = {};
    vars['lang'] = lang;
    const cwd = _path.resolve(__dirname + '/../../') + '/'; // built/
    const docs = _glob.sync(`docs/**/*.${lang}.md`, {
        cwd
    });
    vars['docs'] = {};
    for (const x of docs){
        const [, name] = x.match(/docs\/(.+?)\.(.+?)\.md$/);
        if (vars['docs'][name] == null) {
            vars['docs'][name] = {
                name,
                title: {}
            };
        }
        vars['docs'][name]['title'][lang] = (await _fs.promises.readFile(cwd + x, 'utf-8')).match(/^# (.+?)\r?\n/)[1];
    }
    vars['kebab'] = (string)=>string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
    vars['config'] = _config.default;
    vars['copyright'] = _constjson.copyright;
    vars['i18n'] = (key)=>_nestedproperty.get(_locales[lang], key);
    return vars;
}
const router = new _router();
router.get('/assets/*', async (ctx)=>{
    await _koasend(ctx, ctx.params[0], {
        root: `${__dirname}/../../docs/assets/`,
        maxage: ms('1 days')
    });
});
router.get('/*/*', async (ctx)=>{
    const lang = getLang(ctx.params[0]);
    const doc = ctx.params[1];
    _showdown.extension('urlExtension', ()=>({
            type: 'output',
            regex: /%URL%/g,
            replace: _config.default.url
        }));
    _showdown.extension('wsUrlExtension', ()=>({
            type: 'output',
            regex: /%WS_URL%/g,
            replace: _config.default.wsUrl
        }));
    _showdown.extension('apiUrlExtension', ()=>({
            type: 'output',
            regex: /%API_URL%/g,
            replace: _config.default.apiUrl
        }));
    const conv = new _showdown.Converter({
        tables: true,
        extensions: [
            'urlExtension',
            'apiUrlExtension',
            'highlightjs'
        ]
    });
    const md = await _fs.promises.readFile(`${__dirname}/../../docs/${doc}.${lang}.md`, 'utf8');
    const { csp } = (0, _.genCsp)();
    await ctx.render('docs-article', Object.assign({
        id: doc,
        html: conv.makeHtml(md),
        title: md.match(/^# (.+?)\r?\n/)[1],
        version: _config.default.version
    }, await genVars(lang)));
    ctx.set('Content-Security-Policy', csp);
    ctx.set('Cache-Control', 'public, max-age=60');
});
const _default = router;

//# sourceMappingURL=docs.js.map
