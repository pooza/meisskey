"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    removeOrphanedBrackets: function() {
        return removeOrphanedBrackets;
    },
    mfmLanguage: function() {
        return mfmLanguage;
    }
});
const _parsimmon = require("parsimmon");
const _utils = require("./utils");
const _parse = require("../misc/acct/parse");
const _ = require("punycode/");
const _emojiregex = require("../misc/emoji-regex");
const _tinycolor2 = require("tinycolor2");
function removeOrphanedBrackets(s) {
    const openBrackets = [
        '(',
        '['
    ];
    const closeBrackets = [
        ')',
        ']'
    ];
    const xs = cumulativeSum(s.split('').map((c)=>{
        if (openBrackets.includes(c)) return 1;
        if (closeBrackets.includes(c)) return -1;
        return 0;
    }));
    const firstOrphanedCloseBracket = xs.findIndex((x)=>x < 0);
    if (firstOrphanedCloseBracket !== -1) return s.substr(0, firstOrphanedCloseBracket);
    const lastMatched = xs.lastIndexOf(0);
    return s.substr(0, lastMatched + 1);
}
const mfmLanguage = _parsimmon.createLanguage({
    root: (r)=>_parsimmon.alt(r.block, r.inline).atLeast(1),
    plain: (r)=>_parsimmon.alt(r.emoji, r.text).atLeast(1),
    plainX: (r)=>_parsimmon.alt(r.inline).atLeast(1),
    basic: (r)=>_parsimmon.alt(r.blockCode, r.inlineCode, r.mention, r.hashtag, r.url, r.link, r.rj, r.emoji, r.text).atLeast(1),
    block: (r)=>_parsimmon.alt(r.title, r.quote, r.search, r.blockCode, r.mathBlock, r.center, r.marquee, r.color),
    inline: (r)=>_parsimmon.alt(r.bigger, r.big, r.bold, r.small, r.italic, r.strike, r.motion, r.spin, r.xspin, r.yspin, r.jump, r.flip, r.vflip, r.rotate, r.inlineCode, r.mathInline, r.mention, r.hashtag, r.url, r.link, r.rj, r.emoji, // 装飾はここに追加
        r.blink, r.twitch, r.shake, r.sup, r.sub, r.rgbshift, r.x1, r.x2, r.x3, r.x4, r.fn, r.text),
    startOfLine: ()=>_parsimmon((input, i)=>{
            if (i == 0 || input[i] == '\n' || input[i - 1] == '\n') {
                return _parsimmon.makeSuccess(i, null);
            } else {
                return _parsimmon.makeFailure(i, 'not newline');
            }
        }),
    title: (r)=>r.startOfLine.then(_parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^([【]([^【】\n]+?)[】])(\n|$)/);
            if (!match) return _parsimmon.makeFailure(i, 'not a title');
            const q = match[2].trim();
            const contents = r.inline.atLeast(1).tryParse(q);
            return _parsimmon.makeSuccess(i + match[0].length, (0, _utils.createMfmNode)('title', {}, contents));
        })),
    quote: (r)=>r.startOfLine.then(_parsimmon((input, i)=>{
            const text = input.substr(i);
            if (!text.match(/^>[\s\S]+?/)) return _parsimmon.makeFailure(i, 'not a quote');
            const quote = takeWhile((line)=>line.startsWith('>'), text.split('\n'));
            const qInner = quote.join('\n').replace(/^>/gm, '').replace(/^ /gm, '');
            if (qInner == '') return _parsimmon.makeFailure(i, 'not a quote');
            const contents = r.root.tryParse(qInner);
            return _parsimmon.makeSuccess(i + quote.join('\n').length + 1, (0, _utils.createMfmNode)('quote', {}, contents));
        })),
    search: (r)=>r.startOfLine.then(_parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^(.+?)( |　)(検索|\[検索\]|Search|\[Search\])(\n|$)/i);
            if (!match) return _parsimmon.makeFailure(i, 'not a search');
            return _parsimmon.makeSuccess(i + match[0].length, (0, _utils.createMfmNode)('search', {
                query: match[1],
                content: match[0].trim()
            }));
        })),
    blockCode: (r)=>r.startOfLine.then(_parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^```(.+?)?\n([\s\S]+?)\n```(\n|$)/i);
            if (!match) return _parsimmon.makeFailure(i, 'not a blockCode');
            return _parsimmon.makeSuccess(i + match[0].length, (0, _utils.createMfmNode)('blockCode', {
                code: match[2],
                lang: match[1] ? match[1].trim() : null
            }));
        })),
    marquee: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<marquee(\s[a-z-]+?)?>(.+?)<\/marquee>/i);
            if (!match) return _parsimmon.makeFailure(i, 'not a marquee');
            return _parsimmon.makeSuccess(i + match[0].length, {
                content: match[2],
                attr: match[1] ? match[1].trim() : null
            });
        }).map((x)=>(0, _utils.createMfmNode)('marquee', {
                attr: x.attr
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    color: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<color\s+(\S+)(?:\s+(\S+))?>([\s\S]+?)<[/]color>/i);
            if (!match) return _parsimmon.makeFailure(i, 'not a color');
            const fg = _tinycolor2(match[1]);
            if (!fg.isValid()) return _parsimmon.makeFailure(i, 'not a valid fg color');
            const bg = _tinycolor2(match[2]);
            return _parsimmon.makeSuccess(i + match[0].length, {
                content: match[3],
                fg: fg.toHex8String(),
                bg: bg.isValid() ? bg.toHex8String() : undefined
            });
        }).map((x)=>(0, _utils.createMfmNode)('color', {
                fg: x.fg,
                bg: x.bg
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    big: (r)=>_parsimmon.regexp(/^\*\*\*([\s\S]+?)\*\*\*/, 1).map((x)=>(0, _utils.createMfmNode)('big', {}, r.inline.atLeast(1).tryParse(x))),
    bigger: (r)=>_parsimmon.regexp(/^\*\*\*\*([\s\S]+?)\*\*\*\*/, 1).map((x)=>(0, _utils.createMfmNode)('bigger', {}, r.inline.atLeast(1).tryParse(x))),
    bold: (r)=>{
        const asterisk = _parsimmon.regexp(/\*\*([\s\S]+?)\*\*/, 1);
        const underscore = _parsimmon.regexp(/__([a-zA-Z0-9\s]+?)__/, 1);
        return _parsimmon.alt(asterisk, underscore).map((x)=>(0, _utils.createMfmNode)('bold', {}, r.inline.atLeast(1).tryParse(x)));
    },
    small: (r)=>_parsimmon.regexp(/<small>([\s\S]+?)<\/small>/, 1).map((x)=>(0, _utils.createMfmNode)('small', {}, r.inline.atLeast(1).tryParse(x))),
    italic: (r)=>{
        const xml = _parsimmon.regexp(/<i>([\s\S]+?)<\/i>/, 1);
        const underscore = _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^(\*|_)([a-zA-Z0-9]+?[\s\S]*?)\1/);
            if (!match) return _parsimmon.makeFailure(i, 'not a italic');
            if (input[i - 1] != null && input[i - 1] != ' ' && input[i - 1] != '\n') return _parsimmon.makeFailure(i, 'not a italic');
            return _parsimmon.makeSuccess(i + match[0].length, match[2]);
        });
        return _parsimmon.alt(xml, underscore).map((x)=>(0, _utils.createMfmNode)('italic', {}, r.inline.atLeast(1).tryParse(x)));
    },
    strike: (r)=>_parsimmon.regexp(/~~([^\n~]+?)~~/, 1).map((x)=>(0, _utils.createMfmNode)('strike', {}, r.inline.atLeast(1).tryParse(x))),
    motion: (r)=>{
        const paren = _parsimmon.regexp(/\(\(\(([\s\S]+?)\)\)\)/, 1);
        const xml = _parsimmon.regexp(/<motion>(.+?)<\/motion>/, 1);
        return _parsimmon.alt(paren, xml).map((x)=>(0, _utils.createMfmNode)('motion', {}, r.inline.atLeast(1).tryParse(x)));
    },
    spin: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<spin(\s[a-z]+?)?>(.+?)<\/spin>/i);
            const matchC = text.match(/^\[\[\[([\s\S]+?)\]\]\]/i);
            if (match) {
                return _parsimmon.makeSuccess(i + match[0].length, {
                    content: match[2],
                    attr: match[1] ? match[1].trim() : null
                });
            } else if (matchC) {
                return _parsimmon.makeSuccess(i + matchC[0].length, {
                    content: matchC[1],
                    attr: null
                });
            } else {
                return _parsimmon.makeFailure(i, 'not a spin');
            }
        }).map((x)=>(0, _utils.createMfmNode)('spin', {
                attr: x.attr
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    xspin: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<xspin(\s[a-z]+?)?>(.+?)<\/xspin>/i);
            if (match) {
                return _parsimmon.makeSuccess(i + match[0].length, {
                    content: match[2],
                    attr: match[1] ? match[1].trim() : null
                });
            } else {
                return _parsimmon.makeFailure(i, 'not a spin');
            }
        }).map((x)=>(0, _utils.createMfmNode)('xspin', {
                attr: x.attr
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    yspin: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<yspin(\s[a-z]+?)?>(.+?)<\/yspin>/i);
            if (match) {
                return _parsimmon.makeSuccess(i + match[0].length, {
                    content: match[2],
                    attr: match[1] ? match[1].trim() : null
                });
            } else {
                return _parsimmon.makeFailure(i, 'not a spin');
            }
        }).map((x)=>(0, _utils.createMfmNode)('yspin', {
                attr: x.attr
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    jump: (r)=>_parsimmon.alt(_parsimmon.regexp(/<jump>(.+?)<\/jump>/, 1), _parsimmon.regexp(/\{\{\{([\s\S]+?)\}\}\}/, 1)).map((x)=>(0, _utils.createMfmNode)('jump', {}, r.inline.atLeast(1).tryParse(x))),
    flip: (r)=>{
        const a = _parsimmon.regexp(/<flip>(.+?)<\/flip>/, 1);
        const b = _parsimmon.regexp(/＜＜＜(.+?)＞＞＞/, 1);
        return _parsimmon.alt(a, b).map((x)=>(0, _utils.createMfmNode)('flip', {}, r.inline.atLeast(1).tryParse(x)));
    },
    vflip: (r)=>_parsimmon.regexp(/<vflip>(.+?)<\/vflip>/, 1).map((x)=>(0, _utils.createMfmNode)('vflip', {}, r.inline.atLeast(1).tryParse(x))),
    rotate: (r)=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(/^<rotate\s+([+-]?\d+)>(.+?)<\/rotate>/i);
            if (match) {
                return _parsimmon.makeSuccess(i + match[0].length, {
                    content: match[2],
                    attr: match[1]
                });
            } else {
                return _parsimmon.makeFailure(i, 'not a rotate');
            }
        }).map((x)=>(0, _utils.createMfmNode)('rotate', {
                attr: x.attr
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    // 装飾はここに追加
    blink: (r)=>_parsimmon.regexp(/<blink>(.+?)<\/blink>/, 1).map((x)=>(0, _utils.createMfmNode)('blink', {}, r.inline.atLeast(1).tryParse(x))),
    twitch: (r)=>_parsimmon.regexp(/<twitch>(.+?)<\/twitch>/, 1).map((x)=>(0, _utils.createMfmNode)('twitch', {}, r.inline.atLeast(1).tryParse(x))),
    shake: (r)=>_parsimmon.regexp(/<shake>(.+?)<\/shake>/, 1).map((x)=>(0, _utils.createMfmNode)('shake', {}, r.inline.atLeast(1).tryParse(x))),
    sup: (r)=>_parsimmon.regexp(/<sup>(.+?)<\/sup>/, 1).map((x)=>(0, _utils.createMfmNode)('sup', {}, r.inline.atLeast(1).tryParse(x))),
    sub: (r)=>_parsimmon.regexp(/<sub>(.+?)<\/sub>/, 1).map((x)=>(0, _utils.createMfmNode)('sub', {}, r.inline.atLeast(1).tryParse(x))),
    rgbshift: (r)=>_parsimmon.regexp(/<rgbshift>(.+?)<\/rgbshift>/, 1).map((x)=>(0, _utils.createMfmNode)('rgbshift', {}, r.inline.atLeast(1).tryParse(x))),
    x1: (r)=>_parsimmon.regexp(/<x1>(.+?)<\/x1>/, 1).map((x)=>(0, _utils.createMfmNode)('x1', {}, r.inline.atLeast(1).tryParse(x))),
    x2: (r)=>_parsimmon.regexp(/<x2>(.+?)<\/x2>/, 1).map((x)=>(0, _utils.createMfmNode)('x2', {}, r.inline.atLeast(1).tryParse(x))),
    x3: (r)=>_parsimmon.regexp(/<x3>(.+?)<\/x3>/, 1).map((x)=>(0, _utils.createMfmNode)('x3', {}, r.inline.atLeast(1).tryParse(x))),
    x4: (r)=>_parsimmon.regexp(/<x4>(.+?)<\/x4>/, 1).map((x)=>(0, _utils.createMfmNode)('x4', {}, r.inline.atLeast(1).tryParse(x))),
    center: (r)=>r.startOfLine.then(_parsimmon.regexp(/<center>([\s\S]+?)<\/center>/, 1).map((x)=>(0, _utils.createMfmNode)('center', {}, r.inline.atLeast(1).tryParse(x)))),
    inlineCode: ()=>_parsimmon.regexp(/`([^´\n]+?)`/, 1).map((x)=>(0, _utils.createMfmNode)('inlineCode', {
                code: x
            })),
    mathBlock: (r)=>r.startOfLine.then(_parsimmon.regexp(/\\\[([\s\S]+?)\\\]/, 1).map((x)=>(0, _utils.createMfmNode)('mathBlock', {
                formula: x.trim()
            }))),
    mathInline: ()=>_parsimmon.regexp(/\\\((.+?)\\\)/, 1).map((x)=>(0, _utils.createMfmNode)('mathInline', {
                formula: x
            })),
    mention: ()=>{
        return _parsimmon((input, i)=>{
            var _input__match, _this;
            const text = input.substr(i);
            // eslint-disable-next-line no-useless-escape
            const match = text.match(/^@\w([\w-]*\w)?(?:@[\w\.\-]+\w)?/);
            if (!match) return _parsimmon.makeFailure(i, 'not a mention');
            // @ の前に何かあればハッシュタグ扱いしない
            if ((_this = input[i - 1]) === null || _this === void 0 ? void 0 : (_input__match = _this.match) === null || _input__match === void 0 ? void 0 : _input__match.call(_this, /[^\s\u200b]/)) return _parsimmon.makeFailure(i, 'not a mention');
            return _parsimmon.makeSuccess(i + match[0].length, match[0]);
        }).map((x)=>{
            const { username, host } = (0, _parse.default)(x.substr(1));
            const canonical = host != null ? `@${username}@${(0, _.toUnicode)(host)}` : x;
            return (0, _utils.createMfmNode)('mention', {
                canonical,
                username,
                host,
                acct: x
            });
        });
    },
    hashtag: ()=>_parsimmon((input, i)=>{
            var _input__match, _this;
            // ローカルサーバーでの新規投稿作成時 / クライアントでのパース時 共通で適用したいハッシュタグ条件はここで指定する
            // ローカルサーバーでの新規投稿作成時 に最終的にどれをハッシュタグとするかはisHashtag()に記述
            // クライアントでのパース時 に最終的にどれをハッシュタグとするかはタグとして添付されているかで決まる
            const text = input.substr(i);
            // eslint-disable-next-line no-useless-escape
            const match = text.match(/^#([^\s\.,!\?'"#:\/()\[\]]+)/i);
            if (!match) return _parsimmon.makeFailure(i, 'not a hashtag');
            const hashtag = match[1];
            // # + U+20E3 / # + U+FE0F + U+20E3 のような 合字/絵文字異体字セレクタ付きは ハッシュタグ扱いしない
            if (hashtag.match(/^(\u20e3|\ufe0f)/)) return _parsimmon.makeFailure(i, 'not a hashtag');
            // # の前に何かあればハッシュタグ扱いしない
            if ((_this = input[i - 1]) === null || _this === void 0 ? void 0 : (_input__match = _this.match) === null || _input__match === void 0 ? void 0 : _input__match.call(_this, /[^\s\u200b]/)) return _parsimmon.makeFailure(i, 'not a hashtag');
            return _parsimmon.makeSuccess(i + ('#' + hashtag).length, (0, _utils.createMfmNode)('hashtag', {
                hashtag: hashtag
            }));
        }),
    url: ()=>{
        return _parsimmon((input, i)=>{
            const text = input.substr(i);
            const match = text.match(_utils.urlRegex);
            let url;
            if (!match) {
                const match = text.match(/^<(https?:\/\/.*?)>/);
                if (!match) return _parsimmon.makeFailure(i, 'not a url');
                url = match[1];
                i += 2;
            } else {
                url = match[0];
                url = removeOrphanedBrackets(url);
                url = url.replace(/[.,]*$/, '');
            }
            return _parsimmon.makeSuccess(i + url.length, url);
        }).map((x)=>(0, _utils.createMfmNode)('url', {
                url: x
            }));
    },
    link: (r)=>{
        return _parsimmon.seqObj([
            'silent',
            _parsimmon.string('?').fallback(null).map((x)=>x != null)
        ], // eslint-disable-next-line no-useless-escape
        _parsimmon.string('['), [
            'text',
            _parsimmon.regexp(/[^\n\[\]]+/)
        ], _parsimmon.string(']'), _parsimmon.string('('), [
            'url',
            r.url
        ], _parsimmon.string(')')).map((x)=>{
            return (0, _utils.createMfmNode)('link', {
                silent: x.silent,
                url: x.url.props.url
            }, _parsimmon.alt(r.emoji, r.text).atLeast(1).tryParse(x.text));
        });
    },
    rj: (r)=>{
        return _parsimmon.alt(_parsimmon.regexp(/([RVB][JE]\d{6,8})/, 1).map((x)=>{
            return (0, _utils.createMfmNode)('link', {
                silent: false,
                url: `https://www.dlsite.com/home/work/=/product_id/${x}.html`
            }, [
                (0, _utils.createMfmNode)('text', {
                    text: x
                })
            ]);
        }), _parsimmon.regexp(/([RVB][G](\d{5}))/, 1).map((x)=>{
            return (0, _utils.createMfmNode)('link', {
                silent: false,
                url: `https://www.dlsite.com/home/circle/profile/=/maker_id/${x}.html`
            }, [
                (0, _utils.createMfmNode)('text', {
                    text: x
                })
            ]);
        }));
    },
    emoji: ()=>{
        const name = _parsimmon.regexp(/:(@?[\w-]+(?:@[\w.-]+)?):/i, 1).map((x)=>(0, _utils.createMfmNode)('emoji', {
                name: x
            }));
        const vcode = _parsimmon.regexp(_emojiregex.vendorEmojiRegex).map((x)=>(0, _utils.createMfmNode)('emoji', {
                emoji: x,
                vendor: true
            }));
        const code = _parsimmon.regexp(_emojiregex.emojiRegex).map((x)=>(0, _utils.createMfmNode)('emoji', {
                emoji: x
            }));
        return _parsimmon.alt(name, vcode, code);
    },
    fn: (r)=>{
        return _parsimmon((input, i)=>{
            var _argsPart_split, _this;
            const text = input.substr(i);
            const match = text.match(/^\$\[([0-9a-z]+)(?:\.([0-9a-z.,=]+))?\s+([^\n\[\]]+)\]/);
            if (!match) return _parsimmon.makeFailure(i, 'not a fn');
            const name = match[1];
            const argsPart = match[2];
            const content = match[3];
            if (![
                'tada',
                'jelly',
                'twitch',
                'shake',
                'spin',
                'jump',
                'bounce',
                'flip',
                'rgbshift',
                'x1',
                'x2',
                'x3',
                'x4',
                'font',
                'blur'
            ].includes(name)) {
                return _parsimmon.makeFailure(i, 'unknown fn name');
            }
            const args = {};
            for (const arg of ((_this = argsPart) === null || _this === void 0 ? void 0 : (_argsPart_split = _this.split) === null || _argsPart_split === void 0 ? void 0 : _argsPart_split.call(_this, ',')) || []){
                const kv = arg.split('=');
                if (kv[0] == '__proto__') return _parsimmon.makeFailure(i, 'prototype pollution');
                if (kv.length === 1) {
                    args[kv[0]] = true;
                } else {
                    args[kv[0]] = kv[1];
                }
            }
            return _parsimmon.makeSuccess(i + match[0].length, {
                name,
                args,
                content
            });
        }).map((x)=>(0, _utils.createMfmNode)('fn', {
                name: x.name,
                args: x.args
            }, r.inline.atLeast(1).tryParse(x.content)));
    },
    text: ()=>_parsimmon.any.map((x)=>(0, _utils.createMfmNode)('text', {
                text: x
            }))
});
/**
 * Returns the longest prefix of elements that satisfy the predicate
 */ function takeWhile(f, xs) {
    const ys = [];
    for (const x of xs){
        if (f(x)) {
            ys.push(x);
        } else {
            break;
        }
    }
    return ys;
}
function cumulativeSum(xs) {
    const ys = Array.from(xs); // deep copy
    for(let i = 1; i < ys.length; i++)ys[i] += ys[i - 1];
    return ys;
}

//# sourceMappingURL=language.js.map
