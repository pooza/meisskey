import User, { isLocalUser, isRemoteUser, pack as packUser, IUser } from '../../models/user';
import Following from '../../models/following';
import FollowRequest from '../../models/follow-request';
import { publishMainStream } from '../stream';
import { renderActivity } from '../../remote/activitypub/renderer';
import renderFollow from '../../remote/activitypub/renderer/follow';
import renderUndo from '../../remote/activitypub/renderer/undo';
import renderBlock from '../../remote/activitypub/renderer/block';
import { deliver } from '../../queue';
import renderReject from '../../remote/activitypub/renderer/reject';
import perUserFollowingChart from '../../services/chart/per-user-following';
import Blocking from '../../models/blocking';
import { publishFollowingChanged, publishMutingChanged } from '../create-event';

export default async function(blocker: IUser, blockee: IUser) {

	await Promise.all([
		cancelRequest(blocker, blockee),
		cancelRequest(blockee, blocker),
		unFollow(blocker, blockee),
		unFollow(blockee, blocker)
	]);

	await Blocking.insert({
		createdAt: new Date(),
		blockerId: blocker._id,
		blockeeId: blockee._id,
	});

	if (isLocalUser(blocker) && isRemoteUser(blockee)) {
		const content = renderActivity(renderBlock(blocker, blockee));
		deliver(blocker, content, blockee.inbox);
	}

	if (isLocalUser(blocker)) {
		publishMutingChanged(blocker._id);
	}

	if (isLocalUser(blockee)) {
		publishMutingChanged(blockee._id);
	}
}

async function cancelRequest(follower: IUser, followee: IUser) {
	const request = await FollowRequest.findOne({
		followeeId: followee._id,
		followerId: follower._id
	});

	if (request == null) {
		return;
	}

	await FollowRequest.remove({
		followeeId: followee._id,
		followerId: follower._id
	});

	await User.update({ _id: followee._id }, {
		$inc: {
			pendingReceivedFollowRequestsCount: -1
		}
	});

	if (isLocalUser(followee)) {
		packUser(followee, followee, {
			detail: true
		}).then(packed => publishMainStream(followee._id, 'meUpdated', packed));
	}

	if (isLocalUser(follower)) {
		packUser(followee, follower, {
			detail: true
		}).then(packed => publishMainStream(follower._id, 'unfollow', packed));
	}

	// リモートにフォローリクエストをしていたらUndoFollow送信
	if (isLocalUser(follower) && isRemoteUser(followee)) {
		const content = renderActivity(renderUndo(renderFollow(follower, followee), follower));
		deliver(follower, content, followee.inbox);
	}

	// リモートからフォローリクエストを受けていたらReject送信
	if (isRemoteUser(follower) && isLocalUser(followee)) {
		const content = renderActivity(renderReject(renderFollow(follower, followee, request.requestId), followee));
		deliver(followee, content, follower.inbox);
	}
}

async function unFollow(follower: IUser, followee: IUser) {
	const following = await Following.findOne({
		followerId: follower._id,
		followeeId: followee._id
	});

	if (following == null) {
		return;
	}

	Following.remove({
		_id: following._id
	});

	//#region Decrement following count
	User.update({ _id: follower._id }, {
		$inc: {
			followingCount: -1
		}
	});
	//#endregion

	//#region Decrement followers count
	User.update({ _id: followee._id }, {
		$inc: {
			followersCount: -1
		}
	});
	//#endregion

	perUserFollowingChart.update(follower, followee, false);

	// Publish unfollow event
	if (isLocalUser(follower)) {
		packUser(followee, follower, {
			detail: true
		}).then(packed => publishMainStream(follower._id, 'unfollow', packed));

		publishFollowingChanged(follower._id);
	}

	// リモートにフォローをしていたらUndoFollow送信
	if (isLocalUser(follower) && isRemoteUser(followee)) {
		const content = renderActivity(renderUndo(renderFollow(follower, followee), follower));
		deliver(follower, content, followee.inbox);
	}
}
