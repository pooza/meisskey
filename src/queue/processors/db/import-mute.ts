import * as Bull from 'bull';
import * as mongo from 'mongodb';

import { queueLogger } from '../../logger';
import User, { IUser, getMute } from '../../../models/user';
import DriveFile from '../../../models/drive-file';
import { getOriginalUrl } from '../../../misc/get-drive-file-url';
import parseAcct from '../../../misc/acct/parse';
import resolveUser from '../../../remote/resolve-user';
import { downloadTextFile } from '../../../misc/download-text-file';
import { isSelfHost, toDbHost } from '../../../misc/convert-host';
import { DbUserImportJobData } from '../..';
import Mute from '../../../models/mute';

const logger = queueLogger.createSubLogger('import-mute');

export async function importMute(job: Bull.Job<DbUserImportJobData>): Promise<string> {
	logger.info(`Importing mute of ${job.data.user._id} ...`);

	const user = await User.findOne({
		_id: new mongo.ObjectID(job.data.user._id.toString())
	});

	if (user == null) {
		return `skip: user not found`;
	}

	const file = await DriveFile.findOne({
		_id: new mongo.ObjectID(job.data.fileId.toString())
	});

	if (file == null) {
		return `skip: file not found`;
	}

	const url = getOriginalUrl(file);

	const csv = await downloadTextFile(url);

	let linenum = 0;

	for (const line of csv.trim().split('\n')) {
		linenum++;

		try {
			const acct = line.split(',')[0].trim();
			const { username, host } = parseAcct(acct);

			let target: IUser | null | undefined = isSelfHost(host) ? await User.findOne({
				host: null,
				usernameLower: username.toLowerCase()
			}) : await User.findOne({
				host: toDbHost(host),
				usernameLower: username.toLowerCase()
			});

			if (host == null && target == null) continue;

			if (target == null) {
				target = await resolveUser(username, host);
			}

			if (target == null) {
				throw `cannot resolve user: @${username}@${host}`;
			}

			// skip myself
			if (target._id.equals(job.data.user._id)) continue;

			logger.info(`Mute[${linenum}] ${target._id} ...`);

			// Check if already muting
			const exist = await getMute(user._id, target._id);

			if (exist != null) {
				continue;
			}

			// Create mute
			await Mute.insert({
				createdAt: new Date(),
				muterId: user._id,
				muteeId: target._id,
			});
		} catch (e) {
			logger.warn(`Error in line:${linenum} ${e}`);
		}
	}

	return `ok: Imported`;
}
