import * as P from 'parsimmon';
import { createLeaf, createTree, urlRegex } from './prelude';
import { Predicate } from '../prelude/relation';
import parseAcct from '../misc/acct/parse';
import { toUnicode } from 'punycode';
import { emojiRegex, vendorEmojiRegex, localEmojiRegex } from '../misc/emoji-regex';

export function removeOrphanedBrackets(s: string): string {
	const openBrackets = ['(', '「', '['];
	const closeBrackets = [')', '」', ']'];
	const xs = cumulativeSum(s.split('').map(c => {
		if (openBrackets.includes(c)) return 1;
		if (closeBrackets.includes(c)) return -1;
		return 0;
	}));
	const firstOrphanedCloseBracket = xs.findIndex(x => x < 0);
	if (firstOrphanedCloseBracket !== -1) return s.substr(0, firstOrphanedCloseBracket);
	const lastMatched = xs.lastIndexOf(0);
	return s.substr(0, lastMatched + 1);
}

export const mfmLanguage = P.createLanguage({
	root: r => P.alt(r.block, r.inline).atLeast(1),
	plain: r => P.alt(r.emoji, r.text).atLeast(1),
	plainX: r => P.alt(r.inline).atLeast(1),
	block: r => P.alt(
		r.title,
		r.quote,
		r.search,
		r.blockCode,
		r.mathBlock,
		r.center,
		r.marquee
	),
	startOfLine: () => P((input, i) => {
		if (i == 0 || input[i] == '\n' || input[i - 1] == '\n') {
			return P.makeSuccess(i, null);
		} else {
			return P.makeFailure(i, 'not newline');
		}
	}),
	title: r => r.startOfLine.then(P((input, i) => {
		const text = input.substr(i);
		const match = text.match(/^([【]([^【】\n]+?)[】])(\n|$)/);
		if (!match) return P.makeFailure(i, 'not a title');
		const q = match[2].trim();
		const contents = r.inline.atLeast(1).tryParse(q);
		return P.makeSuccess(i + match[0].length, createTree('title', contents, {}));
	})),
	quote: r => r.startOfLine.then(P((input, i) => {
		const text = input.substr(i);
		if (!text.match(/^>[\s\S]+?/)) return P.makeFailure(i, 'not a quote');
		const quote = takeWhile(line => line.startsWith('>'), text.split('\n'));
		const qInner = quote.join('\n').replace(/^>/gm, '').replace(/^ /gm, '');
		if (qInner == '') return P.makeFailure(i, 'not a quote');
		const contents = r.root.tryParse(qInner);
		return P.makeSuccess(i + quote.join('\n').length + 1, createTree('quote', contents, {}));
	})),
	search: r => r.startOfLine.then(P((input, i) => {
		const text = input.substr(i);
		const match = text.match(/^(.+?)( |　)(検索|\[検索\]|Search|\[Search\])(\n|$)/i);
		if (!match) return P.makeFailure(i, 'not a search');
		return P.makeSuccess(i + match[0].length, createLeaf('search', { query: match[1], content: match[0].trim() }));
	})),
	blockCode: r => r.startOfLine.then(P((input, i) => {
		const text = input.substr(i);
		const match = text.match(/^```(.+?)?\n([\s\S]+?)\n```(\n|$)/i);
		if (!match) return P.makeFailure(i, 'not a blockCode');
		return P.makeSuccess(i + match[0].length, createLeaf('blockCode', { code: match[2], lang: match[1] ? match[1].trim() : null }));
	})),
	marquee: r => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^<marquee(\s[a-z-]+?)?>(.+?)<\/marquee>/i);
			if (!match) return P.makeFailure(i, 'not a marquee');
			return P.makeSuccess(i + match[0].length, {
				content: match[2], attr: match[1] ? match[1].trim() : null
			});
		}).map(x => createTree('marquee', r.inline.atLeast(1).tryParse(x.content), { attr: x.attr }));
	},
	inline: r => P.alt(
		r.big,
		r.bold,
		r.small,
		r.italic,
		r.strike,
		r.motion,
		r.spin,
		r.xspin,
		r.yspin,
		r.jump,
		r.flip,
		r.vflip,
		r.rotate,
		r.inlineCode,
		r.mathInline,
		r.mention,
		r.hashtag,
		r.url,
		r.link,
		r.emoji,
		r.fn,
		r.text
	),
	big: r => P.regexp(/^\*\*\*([\s\S]+?)\*\*\*/, 1).map(x => createTree('big', r.inline.atLeast(1).tryParse(x), {})),
	bold: r => {
		const asterisk = P.regexp(/\*\*([\s\S]+?)\*\*/, 1);
		const underscore = P.regexp(/__([a-zA-Z0-9\s]+?)__/, 1);
		return P.alt(asterisk, underscore).map(x => createTree('bold', r.inline.atLeast(1).tryParse(x), {}));
	},
	small: r => P.regexp(/<small>([\s\S]+?)<\/small>/, 1).map(x => createTree('small', r.inline.atLeast(1).tryParse(x), {})),
	italic: r => {
		const xml = P.regexp(/<i>([\s\S]+?)<\/i>/, 1);
		const underscore = P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^(\*|_)([a-zA-Z0-9]+?[\s\S]*?)\1/);
			if (!match) return P.makeFailure(i, 'not a italic');
			if (input[i - 1] != null && input[i - 1] != ' ' && input[i - 1] != '\n') return P.makeFailure(i, 'not a italic');
			return P.makeSuccess(i + match[0].length, match[2]);
		});

		return P.alt(xml, underscore).map(x => createTree('italic', r.inline.atLeast(1).tryParse(x), {}));
	},
	strike: r => P.regexp(/~~([^\n~]+?)~~/, 1).map(x => createTree('strike', r.inline.atLeast(1).tryParse(x), {})),
	motion: r => {
		const paren = P.regexp(/\(\(\(([\s\S]+?)\)\)\)/, 1);
		const xml = P.regexp(/<motion>(.+?)<\/motion>/, 1);
		return P.alt(paren, xml).map(x => createTree('motion', r.inline.atLeast(1).tryParse(x), {}));
	},
	spin: r => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^<spin(\s[a-z]+?)?>(.+?)<\/spin>/i);
			const matchC = text.match(/^\[\[\[([\s\S]+?)\]\]\]/i);

			if (match) {
				return P.makeSuccess(i + match[0].length, {
					content: match[2], attr: match[1] ? match[1].trim() : null
				});
			} else if (matchC) {
				return P.makeSuccess(i + matchC[0].length, {
					content: matchC[1], attr: null
				});
			} else {
				return P.makeFailure(i, 'not a spin');
			}
		}).map(x => createTree('spin', r.inline.atLeast(1).tryParse(x.content), { attr: x.attr }));
	},
	xspin: r => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^<xspin(\s[a-z]+?)?>(.+?)<\/xspin>/i);

			if (match) {
				return P.makeSuccess(i + match[0].length, {
					content: match[2], attr: match[1] ? match[1].trim() : null
				});
			} else {
				return P.makeFailure(i, 'not a spin');
			}
		}).map(x => createTree('xspin', r.inline.atLeast(1).tryParse(x.content), { attr: x.attr }));
	},
	yspin: r => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^<yspin(\s[a-z]+?)?>(.+?)<\/yspin>/i);

			if (match) {
				return P.makeSuccess(i + match[0].length, {
					content: match[2], attr: match[1] ? match[1].trim() : null
				});
			} else {
				return P.makeFailure(i, 'not a spin');
			}
		}).map(x => createTree('yspin', r.inline.atLeast(1).tryParse(x.content), { attr: x.attr }));
	},
	jump: r => P.alt(P.regexp(/<jump>(.+?)<\/jump>/, 1), P.regexp(/\{\{\{([\s\S]+?)\}\}\}/, 1)).map(x => createTree('jump', r.inline.atLeast(1).tryParse(x), {})),
	flip: r => {
		const a = P.regexp(/<flip>(.+?)<\/flip>/, 1);
		const b = P.regexp(/＜＜＜(.+?)＞＞＞/, 1);
		return P.alt(a, b).map(x => createTree('flip', r.inline.atLeast(1).tryParse(x), {}));
	},
	vflip: r => P.regexp(/<vflip>(.+?)<\/vflip>/, 1).map(x => createTree('vflip', r.inline.atLeast(1).tryParse(x), {})),
	rotate: r => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(/^<rotate\s+([+-]?\d+)>(.+?)<\/rotate>/i);

			if (match) {
				return P.makeSuccess(i + match[0].length, {
					content: match[2], attr: match[1]
				});
			} else {
				return P.makeFailure(i, 'not a rotate');
			}
		}).map(x => createTree('rotate', r.inline.atLeast(1).tryParse(x.content), { attr: x.attr }));
	},
	center: r => r.startOfLine.then(P.regexp(/<center>([\s\S]+?)<\/center>/, 1).map(x => createTree('center', r.inline.atLeast(1).tryParse(x), {}))),
	inlineCode: () => P.regexp(/`([^´\n]+?)`/, 1).map(x => createLeaf('inlineCode', { code: x })),
	mathBlock: r => r.startOfLine.then(P.regexp(/\\\[([\s\S]+?)\\\]/, 1).map(x => createLeaf('mathBlock', { formula: x.trim() }))),
	mathInline: () => P.regexp(/\\\((.+?)\\\)/, 1).map(x => createLeaf('mathInline', { formula: x })),
	mention: () => {
		return P((input, i) => {
			const text = input.substr(i);
			// eslint-disable-next-line no-useless-escape
			const match = text.match(/^@\w([\w-]*\w)?(?:@[\w\.\-]+\w)?/);
			if (!match) return P.makeFailure(i, 'not a mention');
			if (input[i - 1] != null && input[i - 1].match(/[a-z0-9]/i)) return P.makeFailure(i, 'not a mention');
			return P.makeSuccess(i + match[0].length, match[0]);
		}).map(x => {
			const { username, host } = parseAcct(x.substr(1));
			const canonical = host != null ? `@${username}@${toUnicode(host)}` : x;
			return createLeaf('mention', { canonical, username, host, acct: x });
		});
	},
	hashtag: () => P((input, i) => {
		const text = input.substr(i);
		// eslint-disable-next-line no-useless-escape
		const match = text.match(/^#([^\s\.,!\?'"#:\/\[\]]+)/i);
		if (!match) return P.makeFailure(i, 'not a hashtag');
		let hashtag = match[1];
		hashtag = removeOrphanedBrackets(hashtag);
		if (hashtag.match(/^(\u20e3|\ufe0f)/)) return P.makeFailure(i, 'not a hashtag');
		if (hashtag.match(/^[0-9]+$/)) return P.makeFailure(i, 'not a hashtag');
		if (input[i - 1] != null && input[i - 1].match(/[a-z0-9]/i)) return P.makeFailure(i, 'not a hashtag');
		if (Array.from(hashtag || '').length > 128) return P.makeFailure(i, 'not a hashtag');
		return P.makeSuccess(i + ('#' + hashtag).length, createLeaf('hashtag', { hashtag: hashtag }));
	}),
	url: () => {
		return P((input, i) => {
			const text = input.substr(i);
			const match = text.match(urlRegex);
			let url: string;
			if (!match) {
				const match = text.match(/^<(https?:\/\/.*?)>/);
				if (!match)
					return P.makeFailure(i, 'not a url');
				url = match[1];
				i += 2;
			} else
				url = match[0];
			url = removeOrphanedBrackets(url);
			url = url.replace(/[.,]*$/, '');
			return P.makeSuccess(i + url.length, url);
		}).map(x => createLeaf('url', { url: x }));
	},
	link: r => {
		return P.seqObj(
			['silent', P.string('?').fallback(null).map(x => x != null)] as any,
			// eslint-disable-next-line no-useless-escape
			P.string('['), ['text', P.regexp(/[^\n\[\]]+/)] as any, P.string(']'),
			P.string('('), ['url', r.url] as any, P.string(')'),
		).map((x: any) => {
			return createTree('link', r.inline.atLeast(1).tryParse(x.text), {
				silent: x.silent,
				url: x.url.node.props.url
			});
		});
	},
	emoji: () => {
		const name = P.regexp(/:(@?[\w-]+(?:@[\w.-]+)?):/i, 1).map(x => createLeaf('emoji', { name: x }));
		const vcode = P.regexp(vendorEmojiRegex).map(x => createLeaf('emoji', { emoji: x, vendor: true }));
		const lcode = P.regexp(localEmojiRegex).map(x => createLeaf('emoji', { emoji: x, local: true }));
		const code = P.regexp(emojiRegex).map(x => createLeaf('emoji', { emoji: x }));
		return P.alt(name, lcode, vcode, code);
	},
	fn: r => {
		return P.seqObj(
			P.string('['), ['fn', P.regexp(/[^\s\n\[\]]+/)] as any, P.string(' '), P.optWhitespace, ['text', P.regexp(/[^\n\[\]]+/)] as any, P.string(']'),
		).map((x: any) => {
			let name = x.fn;
			const args = {};
			const separator = x.fn.indexOf('.');
			if (separator > -1) {
				name = x.fn.substr(0, separator);
				for (const arg of x.fn.substr(separator + 1).split(',')) {
					const kv = arg.split('=');
					if (kv.length === 1) {
						args[kv[0]] = true;
					} else {
						args[kv[0]] = kv[1];
					}
				}
			}
			return createTree('fn', r.inline.atLeast(1).tryParse(x.text), {
				name,
				args
			});
		});
	},
	text: () => P.any.map(x => createLeaf('text', { text: x }))
});

/**
 * Returns the longest prefix of elements that satisfy the predicate
 */
function takeWhile<T>(f: Predicate<T>, xs: T[]): T[] {
	const ys = [];
	for (const x of xs) {
		if (f(x)) {
			ys.push(x);
		} else {
			break;
		}
	}
	return ys;
}

function cumulativeSum(xs: number[]): number[] {
	const ys = Array.from(xs); // deep copy
	for (let i = 1; i < ys.length; i++) ys[i] += ys[i - 1];
	return ys;
}
