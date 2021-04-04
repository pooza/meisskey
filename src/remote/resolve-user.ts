import { toUnicode, toASCII } from 'punycode/';
import User, { IUser, IRemoteUser } from '../models/user';
import webFinger from './webfinger';
import config from '../config';
import { createPerson, updatePerson } from './activitypub/models/person';
import { URL } from 'url';
import { remoteLogger } from './logger';
import * as chalk from 'chalk';

const logger = remoteLogger.createSubLogger('resolve-user');

export default async (username: string, _host: string | null, option?: any, resync = false): Promise<IUser | undefined | null> => {
	const usernameLower = username.toLowerCase();

	if (_host == null) {
		logger.info(`return local user: ${usernameLower}`);
		return await User.findOne({ usernameLower, host: null });
	}

	// disableFederationならリモート解決しない
	if (config.disableFederation) return null;

	const configHostAscii = toASCII(config.host).toLowerCase();
	const configHost = toUnicode(configHostAscii);

	const hostAscii = toASCII(_host).toLowerCase();
	const host = toUnicode(hostAscii);

	if (configHost == host) {
		logger.info(`return local user: ${usernameLower}`);
		return await User.findOne({ usernameLower, host: null });
	}

	const user = await User.findOne({ usernameLower, host }, option) as IRemoteUser;

	const acctLower = `${usernameLower}@${hostAscii}`;

	if (user === null) {
		const self = await resolveSelf(acctLower);

		logger.succ(`return new remote user: ${chalk.magenta(acctLower)}`);
		return await createPerson(self.href);
	}

	// resyncオプション OR ユーザー情報が古い場合は、WebFilgerからやりなおして返す
	if (resync || user.lastFetchedAt == null || Date.now() - user.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24) {
		// 繋がらないインスタンスに何回も試行するのを防ぐ, 後続の同様処理の連続試行を防ぐ ため 試行前にも更新する
		await User.update({ _id: user._id }, {
			$set: {
				lastFetchedAt: new Date(),
			},
		});

		try {
			logger.info(`try resync: ${acctLower}`);
			const self = await resolveSelf(acctLower);

			if (user.uri !== self.href) {
				// if uri mismatch, Fix (user@host <=> AP's Person id(IRemoteUser.uri)) mapping.
				logger.info(`uri missmatch: ${acctLower}`);
				logger.info(`recovery missmatch uri for (username=${username}, host=${host}) from ${user.uri} to ${self.href}`);

				// validate uri
				const uri = new URL(self.href);
				if (uri.hostname !== hostAscii) {
					throw new Error(`Invalid uri`);
				}

				await User.update({
					usernameLower,
					host: host
				}, {
					$set: {
						uri: self.href
					}
				});
			} else {
				logger.info(`uri is fine: ${acctLower}`);
			}

			await updatePerson(self.href);

			logger.info(`return resynced remote user: ${acctLower}`);
			return await User.findOne({ uri: self.href });
		} catch (e) {
			logger.warn(`resync failed: ${e.message || e}`);
		}
	}

	logger.info(`return existing remote user: ${acctLower}`);
	return user;
};

async function resolveSelf(acctLower: string) {
	logger.info(`WebFinger for ${chalk.yellow(acctLower)}`);
	const finger = await webFinger(acctLower).catch(e => {
		logger.error(`Failed to WebFinger for ${chalk.yellow(acctLower)}: ${ e.statusCode || e.message }`);
		throw new Error(`Failed to WebFinger for ${acctLower}: ${ e.statusCode || e.message }`);
	});
	const self = finger.links.find(link => link.rel && link.rel.toLowerCase() === 'self');
	if (!self) {
		logger.error(`Failed to WebFinger for ${chalk.yellow(acctLower)}: self link not found`);
		throw new Error('self link not found');
	}
	return self;
}
