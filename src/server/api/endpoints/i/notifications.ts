import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import Notification from '../../../../models/notification';
import { packMany } from '../../../../models/notification';
import { getFriendIds } from '../../common/get-friends';
import read from '../../common/read-notification';
import define from '../../define';
import { getHideUserIds } from '../../common/get-hide-users';

export const meta = {
	desc: {
		'ja-JP': '通知一覧を取得します。',
		'en-US': 'Get notifications.'
	},

	tags: ['account', 'notifications'],

	requireCredential: true,

	kind: ['read:notifications', 'read:account', 'account-read', 'account/read'],

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
			transform: transform,
		},

		untilId: {
			validator: $.optional.type(ID),
			transform: transform,
		},

		following: {
			validator: $.optional.bool,
			default: false
		},

		markAsRead: {
			validator: $.optional.bool,
			default: true
		},

		includeTypes: {
			validator: $.optional.arr($.str.or(['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'poll_vote', 'poll_finished', 'receiveFollowRequest', 'highlight', 'unreadMessagingMessage'])),
			default: [] as string[]
		},

		excludeTypes: {
			validator: $.optional.arr($.str.or(['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'poll_vote', 'poll_finished', 'receiveFollowRequest', 'highlight', 'unreadMessagingMessage'])),
			default: [] as string[]
		}
	},

	res: {
		type: 'array',
		items: {
			type: 'Notification',
		},
	},
};

export default define(meta, async (ps, user) => {
	const hideUserIds = await getHideUserIds(user, false);

	const query = {
		notifieeId: user._id,
		$and: [{
			notifierId: {
				$nin: hideUserIds
			}
		}]
	} as any;

	const sort = {
		_id: -1
	};

	if (ps.following) {
		// ID list of the user itself and other users who the user follows
		const followingIds = await getFriendIds(user._id);

		query.$and.push({
			notifierId: {
				$in: followingIds
			}
		});
	}

	if (ps.sinceId) {
		sort._id = 1;
		query._id = {
			$gt: ps.sinceId
		};
	} else if (ps.untilId) {
		query._id = {
			$lt: ps.untilId
		};
	}

	if (ps.includeTypes.length > 0) {
		query.type = {
			$in: ps.includeTypes
		};
	} else if (ps.excludeTypes.length > 0) {
		query.type = {
			$nin: ps.excludeTypes
		};
	}

	const notifications = await Notification
		.find(query, {
			maxTimeMS: 20000,
			limit: ps.limit,
			sort: sort
		});

	// Mark all as read
	if (notifications.length > 0 && ps.markAsRead) {
		read(user._id, notifications);
	}

	return await packMany(notifications);
});
