import NoteUnread from '../../models/note-unread';
import User, { IUser, getMute, getBlocks } from '../../models/user';
import { INote } from '../../models/note';
import { publishMainStream } from '../stream';

export default async function(user: IUser, note: INote, isSpecified = false) {
	//#region ミュートしているなら無視
	const mute = await getMute(user._id, note.userId);
	if (mute) return;
	const blocks = await getBlocks(user._id, note.userId);
	if (blocks.length > 0) return;
	//#endregion

	const unread = await NoteUnread.insert({
		noteId: note._id,
		userId: user._id,
		isSpecified,
		_note: {
			userId: note.userId
		}
	});

	// 2秒経っても既読にならなかったら「未読の投稿がありますよ」イベントを発行する
	setTimeout(async () => {
		const exist = await NoteUnread.findOne({ _id: unread._id });
		if (exist == null) return;

		User.update({
			_id: user._id
		}, {
			$set: isSpecified ? {
				hasUnreadSpecifiedNotes: true,
				hasUnreadMentions: true
			} : {
				hasUnreadMentions: true
			}
		});

		publishMainStream(user._id, 'unreadMention', note._id);

		if (isSpecified) {
			publishMainStream(user._id, 'unreadSpecifiedNote', note._id);
		}
	}, 2000);
}
