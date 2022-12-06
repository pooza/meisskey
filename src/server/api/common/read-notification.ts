import * as mongo from 'mongodb';
import isObjectId from '../../../misc/is-objectid';
import { default as Notification, INotification } from '../../../models/notification';
import { publishMainStream } from '../../../services/stream';
import { getHideUserIdsById } from './get-hide-users';
import User from '../../../models/user';

/**
 * Mark notifications as read
 */
export default (
	user: string | mongo.ObjectID,
	message: string | string[] | INotification | INotification[] | mongo.ObjectID | mongo.ObjectID[]
) => new Promise<any>(async (resolve, reject) => {

	const userId = isObjectId(user)
		? user
		: new mongo.ObjectID(user);

	const ids: mongo.ObjectID[] = Array.isArray(message)
		? isObjectId(message[0])
			? (message as mongo.ObjectID[])
			: typeof message[0] === 'string'
				? (message as string[]).map(m => new mongo.ObjectID(m))
				: (message as INotification[]).map(m => m._id)
		: isObjectId(message)
			? [(message as mongo.ObjectID)]
			: typeof message === 'string'
				? [new mongo.ObjectID(message)]
				: [(message as INotification)._id];

	// Update documents
	const readResult = await Notification.update({
		_id: { $in: ids },
		isRead: false
	}, {
			$set: {
				isRead: true
			}
		}, {
			multi: true
		});

	if (readResult.nModified === 0) return;

	const hideUserIds = await getHideUserIdsById(userId, false, true);

	// Calc count of my unread notifications
	const count = await Notification
		.count({
			notifieeId: userId,
			notifierId: {
				$nin: hideUserIds
			},
			isRead: false
		}, {
				limit: 1
			});

	if (count == 0) {
		// Update flag
		User.update({ _id: userId }, {
			$set: {
				hasUnreadNotification: false
			}
		});

		// 全ての(いままで未読だった)通知を(これで)読みましたよというイベントを発行
		publishMainStream(userId, 'readAllNotifications');
	}
});
