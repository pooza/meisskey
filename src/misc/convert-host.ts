import config from '../config';
import { toUnicode, toASCII } from 'punycode';
import { URL } from 'url';

export function getFullApAccount(username: string, host: string | null) {
	return host ? `${username}@${toApHost(host)}` : `${username}@${toApHost(config.host)}`;
}

export function isSelfHost(host: string | null) {
	if (host == null) return true;
	return toApHost(config.host) === toApHost(host);
}

export function extractDbHost(uri: string) {
	const url = new URL(uri);
	return toDbHost(url.hostname);
}

export function extractApHost(uri: string) {
	const url = new URL(uri);
	return toApHost(url.hostname);
}

export function toDbHost(host: string): string;
export function toDbHost(host: string | null): string | null;
export function toDbHost(host: string | null): string | null{
	if (host == null) return null;
	return toUnicode(host.toLowerCase());
}

export function toApHost(host: string): string;
export function toApHost(host: string | null): string | null;
export function toApHost(host: string | null): string | null {
	if (host == null) return null;
	return toASCII(host.toLowerCase());
}
