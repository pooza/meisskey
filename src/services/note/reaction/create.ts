import { IUser, isLocalUser, isRemoteUser } from '../../../models/user';
import Note, { INote, pack } from '../../../models/note';
import NoteReaction, { INoteReaction } from '../../../models/note-reaction';
import { publishNoteStream, publishHotStream } from '../../stream';
import { createNotification } from '../../create-notification';
import { renderLike } from '../../../remote/activitypub/renderer/like';
import { deliverToUser, deliverToFollowers } from '../../../remote/activitypub/deliver-manager';
import { renderActivity } from '../../../remote/activitypub/renderer';
import { toDbReaction, decodeReaction } from '../../../misc/reaction-lib';
import { packEmojis } from '../../../misc/pack-emojis';
import Meta from '../../../models/meta';
import { IdentifiableError } from '../../../misc/identifiable-error';
import config from '../../../config';

export default async (user: IUser, note: INote, reaction?: string, dislike = false): Promise<INoteReaction> => {
	reaction = await toDbReaction(reaction, true, user.host);

	const inserted = await NoteReaction.insert({
		createdAt: new Date(),
		noteId: note._id,
		userId: user._id,
		reaction,
		dislike
	}).catch(e => {
		if (e.code === 11000) {
			throw new IdentifiableError('51c42bb4-931a-456b-bff7-e5a8a70dd298', 'already reacted');
		} else {
			throw e;
		}
	});

	// Increment reactions count
	await Note.update({ _id: note._id }, {
		$inc: {
			[`reactionCounts.${reaction}`]: 1,
			score: (user.isBot || inserted.dislike) ? 0 : 1
		}
	});

	incReactionsCount(user);

	const decodedReaction = decodeReaction(reaction);
	const emoji = (await packEmojis([decodedReaction.replace(/:/g, '')], note._user.host))[0];

	publishNoteStream(note._id, 'reacted', {
		reaction: decodedReaction,
		emoji: emoji,
		userId: user._id
	});

	if (note.reactionCounts == null) {
		(async () => {
			const fresh = (await Note.findOne({ _id: note._id }))!;
			publishHotStream((await pack(fresh))!);
		})();
	}

	// リアクションされたユーザーがローカルユーザーなら通知を作成
	if (isLocalUser(note._user)) {
		createNotification(note.userId, user._id, 'reaction', {
			noteId: note._id,
			reaction: reaction
		});
	}

	//#region 配信
	if (isLocalUser(user) && !note.localOnly && !user.noFederation) {
		const content = renderActivity(await renderLike(inserted, note), user);
		if (isRemoteUser(note._user)) deliverToUser(user, content, note._user);
		if (!config.disableLikeBroadcast) deliverToFollowers(user, content, true);
		//deliverToRelays(user, content);
	}
	//#endregion

	return inserted;
};

function incReactionsCount(user: IUser) {
	if (isLocalUser(user)) {
		Meta.update({}, {
			$inc: {
				'stats.reactionsCount': 1,
				//'stats.originalReactionsCount': 1
			}
		}, { upsert: true });
	} else {
		/*
		Meta.update({}, {
			$inc: {
				'stats.originalReactionsCount': 1
			}
		}, { upsert: true });
		*/
	}
}
