import { parseFragment, DefaultTreeDocumentFragment } from 'parse5';
import { URL } from 'url';
import { urlRegexFull, urlRegex } from './prelude';

export function fromHtml(html: string, hashtagNames?: string[]): string | null {
	if (html == null) return null;

	const dom = parseFragment(html) as DefaultTreeDocumentFragment;

	let text = '';

	for (const n of dom.childNodes) {
		analyze(n);
	}

	return text.trim();

	function appendChildren(childNodes: any,): void {
		if (childNodes) {
			for (const n of childNodes) {
				analyze(n);
			}
		}
	}

	function analyze(node: any) {
		switch (node.nodeName) {
			case '#text':
				text += node.value;
				break;

			case 'br':
				text += '\n';
				break;

			case 'a': {
				const txt = getText(node);
				const rel = node.attrs.find((x: any) => x.name == 'rel');
				const href = node.attrs.find((x: any) => x.name == 'href');

				// ハッシュタグ
				if (hashtagNames && href && hashtagNames.map(x => x.toLowerCase()).includes(txt.toLowerCase())) {
					text += txt;
				// メンション
				} else if (txt.startsWith('@') && !(rel && rel.value.match(/^me /))) {
					const part = txt.split('@');

					if (part.length == 2) {
						//#region ホスト名部分が省略されているので復元する
						const acct = `${txt}@${(new URL(href.value)).hostname}`;
						text += acct;
						//#endregion
					} else if (part.length == 3) {
						text += txt;
					}
				// その他
				} else {
					text += !href ? txt
						: txt === href.value
							? txt.match(urlRegexFull) ? txt
							: `<${txt}>`
						: (href.value.match(urlRegex) && !href.value.match(urlRegexFull))	// URLぽいがエンコードされてない
							? `[${txt}](<${href.value}>)`
							: `[${txt}](${href.value})`;
				}
				break;
			}

			case 'div': {
				const align = node.attrs.find((x: any) => x.name === 'align');
				const center = align?.value === 'center';
				if (center) text += '<center>';
				appendChildren(node.childNodes);
				if (center) text += '</center>';
				break;
			}

			case 'p':
				text += '\n\n';
				appendChildren(node.childNodes);
				break;

			case 'h1':
				text += '【';
				appendChildren(node.childNodes);
				text += '】\n';
				break;

			case 'b':
				text += '**';
				appendChildren(node.childNodes);
				text += '**';
				break;

			case 'strong':
				text += '***';
				appendChildren(node.childNodes);
				text += '***';
				break;

			case 'small':
				text += '<small>';
				appendChildren(node.childNodes);
				text += '</small>';
				break;

			case 'del':
				text += '~~';
				appendChildren(node.childNodes);
				text += '~~';
				break;

			case 'i':
				text += '<i>';
				appendChildren(node.childNodes);
				text += '</i>';
				break;

			case 'span': {
				const name = getValue(node, 'data-mfm');
				if (name === 'jelly') {
					text += '<motion>';
					appendChildren(node.childNodes);
					text += '</motion>';
				} else if (name === 'tada') {
						text += '***';
						appendChildren(node.childNodes);
						text += '***';
				} else if (name === 'spin') {
					const tag = hasAttribute(node, 'data-mfm-x') ? 'xspin' : hasAttribute(node, 'data-mfm-y') ? 'yspin' : 'spin';
					const attr = hasAttribute(node, 'data-mfm-left') ? ' left' : hasAttribute(node, 'data-mfm-alternate') ? ' alternate' : '';
					text += `<${tag}${attr}>`;
					appendChildren(node.childNodes);
					text += `</${tag}>`;
				} else if (name === 'jump') {
					text += '<jump>';
					appendChildren(node.childNodes);
					text += '</jump>';
				} else if (name === 'flip') {
					if (hasAttribute(node, 'data-mfm-h') && hasAttribute(node, 'data-mfm-v')) {
						text += `<flip><vflip>`;
						appendChildren(node.childNodes);
						text += `</vflip></flip>`;
					} else if (hasAttribute(node, 'data-mfm-v')) {
						text += `<vflip>`;
						appendChildren(node.childNodes);
						text += `</vflip>`;
					} else {
						text += `<flip>`;
						appendChildren(node.childNodes);
						text += `</flip>`;
					}
				} else if (name === 'rotate') {
					const deg = node.attrs.find((x: any) => x.name == 'data-mfm-deg');
					text += `<rotate ${deg.value}>`;
					appendChildren(node.childNodes);
					text += `</rotate>`;
				} else if (name?.match(/^[a-z]+$/)) {
					const args = [];
					for (const attr of node.attrs) {
						const m = attr.name.match(/^data-mfm-([a-z]+)$/);
						if (!m) continue;
						const key = m[1];
						args.push(attr.name === attr.value ? key : `${key}=${attr.value}`);
					}

					text += args.length > 0 ? `[${name}.${args.join(',')} ` : `[${name} `;
					appendChildren(node.childNodes);
					text += ']';
				} else {
					appendChildren(node.childNodes);
				}
				break;
			}

			case 'marquee': {
				const direction = getValue(node, 'direction');
				const behavior = getValue(node, 'behavior');

				const attr
					= behavior === 'alternate' ? ' alternate'
					: behavior === 'slide'
						? direction === 'right' ? ' reverse-slide' : ' slide'
						: direction === 'right' ? ' reverse' : ''

						text += `<marquee${attr}>`;
					appendChildren(node.childNodes);
					text += `</marquee>`;
				break;
			}

			// block code (<pre><code>)
			case 'pre': {
				if (node.childNodes.length === 1 && node.childNodes[0].nodeName === 'code') {
					const lang = node.childNodes[0].attrs.find((x: any) => x.name == 'data-mfm-lang');
					text += '```' + (lang?.value || '') + '\n';
					text += getText(node.childNodes[0]);
					text += '\n```\n';
				} else {
					appendChildren(node.childNodes);
				}
				break;
			}

			// inline code (<code>)
			case 'code': {
				const name = getValue(node, 'data-mfm');
				if (name === 'math') {
					text += '\\\(';
					text += getText(node);
					text += '\\\)';
				} else {
					text += '`';
					appendChildren(node.childNodes);
					text += '`';
				}
				break;
			}

			case 'blockquote': {
				const t = getText(node);
				if (t) {
					text += '> ';
					text += t.split('\n').join(`\n> `);
				}
				break;
			}

			default:
				if (node.childNodes) {
					for (const n of node.childNodes) {
						analyze(n);
					}
				}
				break;
		}
	}
}

function getText(node: any): string {
	if (node.nodeName == '#text') return node.value;
	if (node.nodeName == 'br') return '\n';

	if (node.childNodes) {
		return node.childNodes.map((n: any) => getText(n)).join('');
	}

	return '';
}

function getValue(node: any, name: string): string | undefined {
	return node.attrs.find((x: any) => x.name == name)?.value || undefined;
}

function hasAttribute(node: any, name: string) {
	return !!node.attrs.find((x: any) => x.name == name);
}
