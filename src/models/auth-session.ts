import * as mongo from 'mongodb';
import * as deepcopy from 'deepcopy';
import db from '../db/mongodb';
import isObjectId from '../misc/is-objectid';
import { pack as packApp } from './app';

const AuthSession = db.get<IAuthSession>('authSessions');
export default AuthSession;

export interface IAuthSession {
	_id: mongo.ObjectID;
	createdAt: Date;
	appId: mongo.ObjectID;
	userId: mongo.ObjectID;
	token: string;
}

/**
 * Pack an auth session for API response
 *
 * @param {any} session
 * @param {any} me?
 * @return {Promise<any>}
 */
export const pack = async (
	session: any,
	me?: any
) => {
	let _session: any;

	// TODO: Populate session if it ID
	// eslint-disable-next-line prefer-const
	_session = deepcopy(session);

	// Me
	if (me && !isObjectId(me)) {
		if (typeof me === 'string') {
			me = new mongo.ObjectID(me);
		} else {
			me = me._id;
		}
	}

	delete _session._id;

	// Populate app
	_session.app = await packApp(_session.appId, me);

	return _session;
};
