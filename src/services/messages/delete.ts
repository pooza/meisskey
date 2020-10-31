import config from '../../config';
import User, { isLocalUser, isRemoteUser } from '../../models/user';
import MessagingMessage, { IMessagingMessage } from '../../models/messaging-message';
import { publishMessagingStream } from '../stream';
import { renderActivity } from '../../remote/activitypub/renderer';
import renderDelete from '../../remote/activitypub/renderer/delete';
import renderTombstone from '../../remote/activitypub/renderer/tombstone';
import { deliver } from '../../queue';

export async function deleteMessage(message: IMessagingMessage) {
	await MessagingMessage.remove({ _id: message._id });
	postDeleteMessage(message);
}

async function postDeleteMessage(message: IMessagingMessage) {
	const user = await User.findOne({ _id: message.userId});
	const recipient = await User.findOne({ _id: message.recipientId});
	if (user == null || recipient == null) return;

	if (isLocalUser(user)) {
		publishMessagingStream(user._id, message.recipientId, 'deleted', message._id);
	}

	if (isLocalUser(recipient)) {
		publishMessagingStream(recipient._id, message.userId, 'deleted', message._id);
	}

	if (isLocalUser(user) && isRemoteUser(recipient)) {
		const activity = renderActivity(renderDelete(renderTombstone(`${config.url}/notes/${message._id}`), user, `${config.url}/notes/${message._id}/delete`));
		deliver(user, activity, recipient.inbox);
	}
}
