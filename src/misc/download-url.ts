import * as fs from 'fs';
import * as stream from 'stream';
import * as util from 'util';
import fetch from 'node-fetch';
import { httpAgent, httpsAgent } from './fetch';
import { AbortController } from 'abort-controller';
import * as ContentDisposition from 'content-disposition';
import config from '../config';
import * as chalk from 'chalk';
import Logger from '../services/logger';

const pipeline = util.promisify(stream.pipeline);

export async function downloadUrl(url: string, path: string) {
	const logger = new Logger('download-url');

	logger.info(`Downloading ${chalk.cyan(url)} ...`);

	const controller = new AbortController();
	setTimeout(() => {
		controller.abort();
	}, 60 * 1000);

	const response = await fetch(new URL(url).href, {
		headers: {
			'User-Agent': config.userAgent
		},
		timeout: 10 * 1000,
		size: 1024 * 1024 * 1024,
		signal: controller.signal,
		agent: u => u.protocol == 'http:' ? httpAgent : httpsAgent,
	});

	if (!response.ok) {
		logger.error(`Got ${response.status} (${url})`);
		throw response.status;
	}

	// Content-Lengthがあればとっておく
	const contentLength = response.headers.get('content-length');
	const expectedLength = contentLength != null ? Number(contentLength) : null;

	await pipeline(response.body, fs.createWriteStream(path));

	// 可能ならばサイズ比較
	const actualLength = (await util.promisify(fs.stat)(path)).size;

	if (response.headers.get('content-encoding') == null && expectedLength != null && expectedLength !== actualLength) {
		throw `size error: expected: ${expectedLength}, but got ${actualLength}`;
	}

	logger.succ(`Download finished: ${chalk.cyan(url)}`);

	let filename: string | null = null;
	try {
		const contentDisposition = response.headers.get('content-disposition');
		if (contentDisposition) {
			const cd = ContentDisposition.parse(contentDisposition);
			if (cd.parameters?.filename) filename = cd.parameters.filename;
		}
	} catch { }

	return {
		filename,
		url: response.url
	};
}
