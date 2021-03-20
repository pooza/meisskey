import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import User, { IUser, ILocalUser, pack as packUser } from '../../../../models/user';
import Following, { IFollowing } from '../../../../models/following';
import { pack } from '../../../../models/user';
import { getFriendIds } from '../../common/get-friends';
import define from '../../define';
import { ApiError } from '../../error';
import { canShowFollows } from '../../common/can-show-follows';
import { PackedFollower } from '../../../../models/packed-schemas';
import { toOidString, toISODateOrNull } from '../../../../misc/pack-utils';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーのフォロワー一覧を取得します。',
		'en-US': 'Get followers of a user.'
	},

	tags: ['users'],

	requireCredential: false,

	params: {
		userId: {
			validator: $.optional.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},

		username: {
			validator: $.optional.str
		},

		host: {
			validator: $.optional.nullable.str
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		cursor: {
			validator: $.optional.type(ID),
			default: null as any,
			transform: transform,
			desc: {
				'ja-JP': '指定すると、このIDより過去のレコードを取得します。'
			}
		},

		sinceId: {
			validator: $.optional.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '指定すると、このIDより未来のレコードを取得します。またソート順が逆になります。'
			}
		},

		untilId: {
			validator: $.optional.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '指定すると、このIDより過去のレコードを取得します。'
			}
		},

		v11compatible: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': '指定すると、Entiryがv11互換に変わります。'
			}
		},

		iknow: {
			validator: $.optional.bool,
			default: false,
		},

		diff: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': '相互フォローは除く'
			}
		},
	},

	res: {
		type: 'object',
		properties: {
			users: {
				type: 'array',
				items: {
					type: 'User',
				}
			},
			next: {
				type: 'string',
				format: 'id',
				nullable: true
			}
		}
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '27fa5435-88ab-43de-9360-387de88727cd'
		}
	}
};

export default define(meta, async (ps, me) => {
	const q: any = ps.userId != null
		? { _id: ps.userId }
		: { usernameLower: ps.username.toLowerCase(), host: ps.host };

	const user = await User.findOne(q);

	if (user == null) {
		throw new ApiError(meta.errors.noSuchUser);
	}

	if (!await canShowFollows(me, user)) {
		return {
			users: [],
			next: null,
		};
	}

	const query = {
		followeeId: user._id
	} as any;

	// ログインしていてかつ iknow フラグがあるとき
	if (me && ps.iknow) {
		// Get my friends
		const myFriends = await getFriendIds(me._id);

		query.followerId = {
			$in: myFriends
		};
	}

	if (ps.diff && me && me._id.equals(user._id)) {
		const followingIds = await getFriendIds(user._id);

		query.followerId = {
			$nin: followingIds
		};
	}

	// TODO: iknow && diff

	const sort = {
		_id: -1
	};

	// カーソルが指定されている場合
	if (ps.cursor) {
		query._id = {
			$lt: ps.cursor
		};
	// v11互換パラメーター
	} else if (ps.sinceId) {
		sort._id = 1;
		query._id = {
			$gt: ps.sinceId
		};
	} else if (ps.untilId) {
		query._id = {
			$lt: ps.untilId
		};
	}

	// Get followers
	const following = await Following.aggregate([{
		$match: query
	}, {
		$sort: { _id: -1 }
	}, {
		$limit: ps.limit! + (ps.v11compatible ? 0 : 1)
	}, {
		// join User
		$lookup: {
			from: 'users',
			localField: 'followerId',
			foreignField: '_id',
			as: '_user',
		}
	}, {
		$unwind: '$_user'
	}]) as (IFollowing & { _user: IUser })[];

	if (!ps.v11compatible) { // V10Following
		// 「次のページ」があるかどうか
		const inStock = following.length === ps.limit! + 1;
		if (inStock) {
			following.pop();
		}

		const users = await Promise.all(following.map(f => pack(f._user, me, { detail: true })));

		return {
			users: users,
			next: inStock ? following[following.length - 1]._id : null,
		};
	} else {
		const packFollower = async (
			x: IFollowing & { _user: IUser },
			me?: ILocalUser | null | undefined,
		): Promise<PackedFollower> => {
			return {
				id: toOidString(x._id),
				createdAt: toISODateOrNull(x.createdAt),
				followeeId: toOidString(x.followeeId),
				followerId: toOidString(x.followerId),
				follower: await packUser(x._user, me, { detail: true }),
			};
		}

		return await Promise.all(following.map(x => packFollower(x)));
	}
});
