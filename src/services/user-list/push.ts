import { pack as packUser, IUser, isRemoteUser, fetchProxyAccount } from '../../models/user';
import UserList, { IUserList } from '../../models/user-list';
import { publishUserListStream } from '../stream';
import Following from '../../models/following';
import { fetchOutbox } from '../../remote/activitypub/models/person';
import createFollowing from '../following/create';

export async function pushUserToUserList(target: IUser, list: IUserList) {
	await UserList.update({ _id: list._id }, {
		$push: {
			userIds: target._id
		}
	});

	publishUserListStream(list._id, 'userAdded', await packUser(target));

	// このインスタンス内にこのリモートユーザーをフォローしているユーザーがいなくても投稿を受け取るためにダミーのユーザーがフォローしたということにする
	if (isRemoteUser(target)) {
		const count = await Following.count({
			followeeId: target._id,
			'_follower.host': null
		});

		if (count < 1) {
			const proxy = await fetchProxyAccount();
			createFollowing(proxy, target);

			fetchOutbox(target);
		}
	}
}
