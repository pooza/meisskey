import { IRemoteUser } from '../../../models/user';
import { ILike, getApId, getApType } from '../type';
import create from '../../../services/note/reaction/create';
import { extractEmojis, fetchNote } from '../models/note';
import config from '../../../config';

export default async (actor: IRemoteUser, activity: ILike): Promise<string> => {
	const targetUri = getApId(activity.object);

	if (config.ignoreForeignLike) {
		const u = new URL(targetUri);
		if (config.hostname !== u.hostname) {
			return `skip: ignore foreign Like`;
		}
	}

	const note = await fetchNote(targetUri);
	if (!note) return `skip: target note not found ${targetUri}`;

	await extractEmojis(activity.tag, actor.host).catch(() => null);

	try {
		await create(actor, note, activity._misskey_reaction || activity.content || activity.name, getApType(activity) === 'Dislike');
	} catch (e: any) {
		if (e.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') return `skip: reacted`;
		if (e.id === 'e70412a4-7197-4726-8e74-f3e0deb92aa7') return `skip: bloked`;
		throw e;
	}

	return `ok`;
};
