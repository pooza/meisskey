import Meta, { IMeta } from '../models/meta';

const defaultMeta: any = {
	name: 'Misskey',
	maintainer: {},
	langs: [],
	cacheRemoteFiles: true,
	localDriveCapacityMb: 256,
	remoteDriveCapacityMb: 8,
	hidedTags: [],
	stats: {
		originalNotesCount: 0,
		originalUsersCount: 0
	},
	maxNoteTextLength: 1000,
	enableEmojiReaction: true,
	enableTwitterIntegration: false,
	enableGithubIntegration: false,
	enableDiscordIntegration: false,
	mascotImageUrl: '/assets/ai.png',
	errorImageUrl: 'https://xn--931a.moe/aiart/yubitun.png',
	enableServiceWorker: false
};

export default async function(): Promise<IMeta> {
	const meta = await Meta.findOne({});

	return Object.assign({}, defaultMeta, meta);
}
