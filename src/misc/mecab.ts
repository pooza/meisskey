import { parse as parseMfm } from '../mfm/parse';
import toText from '../mfm/toText';
import toWord from '../mfm/toWord';
import { promisify } from 'util';
import config from '../config';
import { unique } from '../prelude/array';
import fetch from 'node-fetch';
import { getAgentByUrl } from './fetch';
const MeCab = require('mecab-async');

export async function getIndexer(note: Partial<Record<'text' | 'cw', string>>): Promise<string[]> {
	const source = `${note.text || ''} ${note.cw || ''}`;
	const text = toText(parseMfm(source)!);
	const tokens = await me(text);
	return unique(tokens.filter(token => ['フィラー', '感動詞', '形容詞', '連体詞', '動詞', '副詞', '名詞'].includes(token[1])).map(token => token[0]));
}

export async function getWordIndexer(note: Partial<Record<'text' | 'cw', string>>): Promise<string[]> {
	const source = `${note.text || ''} ${note.cw || ''}`;
	const text = toWord(parseMfm(source)!);
	const tokens = await me(text);
	const words = unique(tokens.filter(token => token[2] === '固有名詞').map(token => token[0]));

	// is とか to が固有名詞扱いで入ってしまうので英字のみは飛ばしてしまう
	const filtered = words.filter(x => !x.match(/^[A-Za-z.,\s]+$/));
	return filtered;
}

async function me(text: string): Promise<string[][]> {
	if (config.mecabSearch?.mecabServer) {
		const s = await req(config.mecabSearch.mecabServer, text);
		return s.result;
	}

	const mecab = new MeCab();
	mecab.command = config.mecabSearch?.mecabDic ? `${config.mecabSearch.mecabBin} -d ${config.mecabSearch.mecabDic}` : config.mecabSearch?.mecabBin;
	return await promisify(mecab.parse).bind(mecab)(text);
}

export async function req(url: string, text: string) {
	const res = await fetch(url, {
		method: 'post',
		body: JSON.stringify({
			text
		}),
		headers: {
			'User-Agent': config.userAgent,
			'Content-Type': 'application/json'
		},
		timeout: 10000,
		size: 10 * 1024 * 1024,
		agent: getAgentByUrl,
	});

	if (!res.ok) {
		throw {
			name: `StatusError`,
			statusCode: res.status,
			message: `${res.status} ${res.statusText}`,
		};
	}

	try {
		return await res.json();
	} catch (e) {
		throw {
			name: `JsonParseError`,
			statusCode: 481,
			message: `JSON parse error ${e.message || e}`
		};
	}
}
