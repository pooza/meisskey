import * as mongo from 'mongodb';
import isObjectId from '../../../misc/is-objectid';
import Message, { IMessagingMessage } from '../../../models/messaging-message';
import { IMessagingMessage as IMessage } from '../../../models/messaging-message';
import { publishMainStream } from '../../../services/stream';
import { publishMessagingStream } from '../../../services/stream';
import { publishMessagingIndexStream } from '../../../services/stream';
import User, { ILocalUser, IRemoteUser } from '../../../models/user';
import { renderActivity } from '../../../remote/activitypub/renderer';
import { renderReadActivity } from '../../../remote/activitypub/renderer/read';
import { deliver } from '../../../queue';
import { toArray } from '../../../prelude/array';
import orderedCollection from '../../../remote/activitypub/renderer/ordered-collection';

/**
 * Mark messages as read
 */
export default async (
	user: string | mongo.ObjectID,
	otherparty: string | mongo.ObjectID,
	message: string | string[] | IMessage | IMessage[] | mongo.ObjectID | mongo.ObjectID[]
) => {
	// populate my (メッセージを読んだユーザー) user id
	const userId = isObjectId(user)
		? user
		: new mongo.ObjectID(user);

	// populate otherparty (メッセージを読まれた/既読通知を送られる側) user id
	const otherpartyId = isObjectId(otherparty)
		? otherparty
		: new mongo.ObjectID(otherparty);

	// populate target message ids
	const ids: mongo.ObjectID[] = Array.isArray(message)
		? isObjectId(message[0])
			? (message as mongo.ObjectID[])
			: typeof message[0] === 'string'
				? (message as string[]).map(m => new mongo.ObjectID(m))
				: (message as IMessage[]).map(m => m._id)
		: isObjectId(message)
			? [(message as mongo.ObjectID)]
			: typeof message === 'string'
				? [new mongo.ObjectID(message)]
				: [(message as IMessage)._id];

	// 実際に既読にされるであろうメッセージを予め取得
	const toRead = await Message.find({
		_id: { $in: ids },
		userId: otherpartyId,
		recipientId: userId,
		isRead: false
	});

	if (toRead.length === 0) return [];

	// 必要であれば既読処理
	await Message.update({
		_id: { $in: toRead.map(x => x._id) },
	}, {
			$set: {
				isRead: true
			}
		}, {
			multi: true
		});

	// Publish event
	publishMessagingStream(otherpartyId, userId, 'read', toRead.map(x => x._id.toString()));
	publishMessagingIndexStream(userId, 'read', toRead.map(x => x._id.toString()));

	// Calc count of my unread messages
	const count = await Message
		.count({
			recipientId: userId,
			isRead: false
		}, {
				limit: 1
			});

	if (count == 0) {
		// Update flag
		User.update({ _id: userId }, {
			$set: {
				hasUnreadMessagingMessage: false
			}
		});

		// 全ての(いままで未読だった)自分宛てのメッセージを(これで)読みましたよというイベントを発行
		publishMainStream(userId, 'readAllMessagingMessages');
	}

	return toRead;
};

export async function deliverReadActivity(user: ILocalUser, recipient: IRemoteUser, messages: IMessagingMessage | IMessagingMessage[]) {
	messages = toArray(messages).filter(x => x.uri);
	const contents = messages.map(x => renderReadActivity(user, x));

	if (contents.length > 1) {
		const collection = orderedCollection(null, contents.length, undefined, undefined, contents);
		deliver(user, renderActivity(collection), recipient.inbox);
	} else {
		for (const content of contents) {
			deliver(user, renderActivity(content), recipient.inbox);
		}
	}
}
