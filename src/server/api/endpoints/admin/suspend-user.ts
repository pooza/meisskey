import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import define from '../../define';
import User, { isLocalUser } from '../../../../models/user';
import { doPostSuspend } from '../../../../services/suspend-user';
import { publishTerminate } from '../../../../services/create-event';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーを凍結します。',
		'en-US': 'Suspend a user.'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		userId: {
			validator: $.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーID',
				'en-US': 'The user ID which you want to suspend'
			}
		},
	}
};

export default define(meta, async (ps) => {
	const user = await User.findOne({
		_id: ps.userId
	});

	if (user == null) {
		throw new Error('user not found');
	}

	if (user.isAdmin) {
		throw new Error('cannot suspend admin');
	}

	if (user.isModerator) {
		throw new Error('cannot suspend moderator');
	}

	await User.findOneAndUpdate({
		_id: user._id
	}, {
		$set: {
			isSuspended: true
		}
	});

	if (isLocalUser(user)) {
		publishTerminate(user._id);
	}

	doPostSuspend(user);
});
