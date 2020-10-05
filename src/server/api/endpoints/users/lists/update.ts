import $ from 'cafy';
import ID, { transform } from '../../../../../misc/cafy-id';
import UserList, { pack } from '../../../../../models/user-list';
import define from '../../../define';
import { ApiError } from '../../../error';
import { publishUserListStream } from '../../../../../services/stream';
import { publishFilterChanged } from '../../../../../services/create-event';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーリストを更新します。',
		'en-US': 'Update a user list'
	},

	tags: ['lists'],

	requireCredential: true,

	kind: ['write:account', 'account-write', 'account/write'],

	params: {
		listId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象となるユーザーリストのID',
				'en-US': 'ID of target user list'
			}
		},

		title: {
			validator: $.str.range(1, 100),
			desc: {
				'ja-JP': 'このユーザーリストの名前',
				'en-US': 'name of this user list'
			}
		},

		hideFromHome: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'これらのユーザーをホームに表示しない'
			}
		},

		mediaOnly: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'メディア投稿のみ'
			}
		},
	},

	errors: {
		noSuchList: {
			message: 'No such list.',
			code: 'NO_SUCH_LIST',
			id: '796666fe-3dff-4d39-becb-8a5932c1d5b7'
		},
	}
};

export default define(meta, async (ps, user) => {
	// Fetch the list
	const userList = await UserList.findOne({
		_id: ps.listId,
		userId: user._id
	});

	if (userList == null) {
		throw new ApiError(meta.errors.noSuchList);
	}

	const set = {
		title: ps.title
	} as any;

	if (typeof ps.hideFromHome == 'boolean') set.hideFromHome = ps.hideFromHome;
	if (typeof ps.mediaOnly == 'boolean') set.mediaOnly = ps.mediaOnly;

	await UserList.update({ _id: userList._id }, {
		$set: set
	});

	publishUserListStream(userList._id, 'settingChanged');

	publishFilterChanged(user._id);

	return await pack(userList._id);
});
