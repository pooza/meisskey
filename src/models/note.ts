import * as mongo from 'mongodb';
import * as deepcopy from 'deepcopy';
import rap from '@prezzemolo/rap';
import db from '../db/mongodb';
import isObjectId from '../misc/is-objectid';
import { length } from 'stringz';
import { IUser, pack as packUser } from './user';
import { pack as packApp } from './app';
import PollVote from './poll-vote';
import NoteReaction from './note-reaction';
import { packMany as packFileMany, IDriveFile } from './drive-file';
import Following from './following';
import Emoji from './emoji';
import { packEmojis } from '../misc/pack-emojis';
import { dbLogger } from '../db/logger';
import { decodeReaction, decodeReactionCounts } from '../misc/reaction-lib';
import { parse } from '../mfm/parse';
import { toString } from '../mfm/to-string';

const Note = db.get<INote>('notes');
Note.createIndex('uri', { sparse: true, unique: true });
Note.createIndex('mentions');
Note.createIndex('visibleUserIds');
Note.createIndex('replyId');
Note.createIndex('renoteId');
Note.createIndex('tagsLower');
Note.createIndex('_user.host');
Note.createIndex('_files._id');
Note.createIndex('_files.contentType');
Note.createIndex({ createdAt: -1 });
Note.createIndex({ score: -1 }, { sparse: true });
Note.createIndex({ '_user.host': 1, replyId: 1, _id: -1 });
Note.createIndex('mecabWords');
Note.createIndex('trendWords');
Note.createIndex({ 'userId': 1, _id: -1 });
Note.dropIndex('userId').catch(() => {});

export default Note;

export function isValidCw(text: string): boolean {
	return length(text.trim()) <= 500;
}

export type INote = {
	_id: mongo.ObjectID;
	createdAt: Date;
	deletedAt: Date;
	updatedAt?: Date;
	fileIds: mongo.ObjectID[];
	replyId: mongo.ObjectID;
	renoteId: mongo.ObjectID;
	poll: IPoll;
	name?: string;
	text: string;
	tags: string[];
	tagsLower: string[];
	emojis: string[];
	cw: string;
	userId: mongo.ObjectID;
	appId: mongo.ObjectID;
	viaMobile: boolean;
	localOnly: boolean;
	copyOnce?: boolean;
	renoteCount: number;
	repliesCount: number;
	reactionCounts: Record<string, number>;
	mentions: mongo.ObjectID[];
	mentionedRemoteUsers: {
		uri: string;
		url?: string;
		username: string;
		host: string;
	}[];

	/**
	 * public ... 公開
	 * home ... ホームタイムライン(ユーザーページのタイムライン含む)のみに流す
	 * followers ... フォロワーのみ
	 * specified ... visibleUserIds で指定したユーザーのみ
	 */
	visibility: 'public' | 'home' | 'followers' | 'specified';

	visibleUserIds: mongo.ObjectID[];

	geo: {
		coordinates: number[];
		altitude: number;
		accuracy: number;
		altitudeAccuracy: number;
		heading: number;
		speed: number;
	};

	/**
	 * AP Object ID
	 */
	uri?: string;

	/**
	 * AP url
	 */
	url?: string;

	/**
	 * 人気の投稿度合いを表すスコア
	 */
	score: number;

	/**
	 * MeCab index
	 */
	mecabWords?: string[];
	trendWords?: string[];

	// 非正規化
	_reply?: {
		userId: mongo.ObjectID;
	};
	_renote?: {
		userId: mongo.ObjectID;
	};
	_user: {
		host: string;
		inbox?: string;
	};
	_files?: IDriveFile[];
};

export type IPoll = {
	choices: IChoice[];
	multiple?: boolean;
	expiresAt?: Date;
};

export type IChoice = {
	id: number;
	text: string;
	votes: number;
};

export const hideNote = async (packedNote: any, meId: mongo.ObjectID) => {
	let hide = false;

	// visibility が private かつ投稿者のIDが自分のIDではなかったら非表示(後方互換性のため)
	if (packedNote.visibility == 'private' && (meId == null || !meId.equals(packedNote.userId))) {
		hide = true;
	}

	// visibility が specified かつ自分が指定されていなかったら非表示
	if (packedNote.visibility == 'specified') {
		if (meId == null) {
			hide = true;
		} else if (meId.equals(packedNote.userId)) {
			hide = false;
		} else {
			// 指定されているかどうか
			const specified = packedNote.visibleUserIds.some((id: any) => meId.equals(id));

			if (specified) {
				hide = false;
			} else {
				hide = true;
			}
		}
	}

	// visibility が followers かつ自分が投稿者のフォロワーでなかったら非表示
	if (packedNote.visibility == 'followers') {
		if (meId == null) {
			hide = true;
		} else if (meId.equals(packedNote.userId)) {
			hide = false;
		} else if (packedNote.reply && meId.equals(packedNote.reply.userId)) {
			// 自分の投稿に対するリプライ
			hide = false;
		} else if (packedNote.mentions && packedNote.mentions.some((id: any) => meId.equals(id))) {
			// 自分へのメンション
			hide = false;
		} else {
			// フォロワーかどうか
			const following = await Following.findOne({
				followeeId: packedNote.userId,
				followerId: meId
			});

			if (following == null) {
				hide = true;
			} else {
				hide = false;
			}
		}
	}

	if (hide) {
		packedNote.fileIds = [];
		packedNote.files = [];
		packedNote.mediaIds = [];
		packedNote.media = [];
		packedNote.replyId = null;
		packedNote.reply = [];
		packedNote.appId = null;
		packedNote.visibleUserIds = null;
		packedNote.reactionCounts = {};
		packedNote.renoteCount = 0;
		packedNote.repliesCount = 0;
		packedNote.text = null;
		packedNote.poll = null;
		packedNote.cw = null;
		packedNote.tags = [];
		packedNote.geo = null;
		packedNote.isHidden = true;
	}
};

export const packMany = async (
	notes: (string | mongo.ObjectID | INote)[],
	me?: string | mongo.ObjectID | IUser,
	options?: {
		detail?: boolean;
		skipHide?: boolean;
		removeError?: boolean;
	}
) => {
	const items = await Promise.all(notes.map(n => pack(n, me, options)));
	return (options && options.removeError) ? items.filter(x => x != null) : items;
};

/**
 * Pack a note for API response
 *
 * @param note target
 * @param me? serializee
 * @param options? serialize options
 * @return response
 */
export const pack = async (
	note: string | mongo.ObjectID | INote,
	me?: string | mongo.ObjectID | IUser,
	options?: {
		detail?: boolean;
		skipHide?: boolean;
	}
) => {
	const opts = Object.assign({
		detail: true,
		skipHide: false
	}, options);

	// Me
	const meId: mongo.ObjectID = me
		? isObjectId(me)
			? me as mongo.ObjectID
			: typeof me === 'string'
				? new mongo.ObjectID(me)
				: (me as IUser)._id
		: null;

	let _note: any;

	// Populate the note if 'note' is ID
	if (isObjectId(note)) {
		_note = await Note.findOne({
			_id: note
		});
	} else if (typeof note === 'string') {
		_note = await Note.findOne({
			_id: new mongo.ObjectID(note)
		});
	} else {
		_note = deepcopy(note);
	}

	// (データベースの欠損などで)投稿がデータベース上に見つからなかったとき
	if (_note == null) {
		dbLogger.warn(`[DAMAGED DB] (missing) pkg: note :: ${note}`);
		return null;
	}

	const id = _note._id;

	// Some counts
	_note.renoteCount = _note.renoteCount || 0;
	_note.repliesCount = _note.repliesCount || 0;
	_note.reactionCounts = _note.reactionCounts ? decodeReactionCounts(_note.reactionCounts) : {};
	_note.reactions = _note.reactionCounts;
	_note.score = _note.score || 0;

	// _note._userを消す前か、_note.userを解決した後でないとホストがわからない
	if (_note._user) {
		const host = _note._user.host;
		// 互換性のため。(古いMisskeyではNoteにemojisが無い)
		if (_note.emojis == null) {
			_note.emojis = Emoji.find({
				host: host
			}, {
				fields: { _id: false }
			});
		} else {
			_note.emojis = packEmojis(_note.emojis, host,
				Object.keys(_note.reactionCounts)
					.map(x => decodeReaction(x))
					.map(x => x.replace(/:/g, '')))
			.catch(e => {
				console.warn(e);
				return [];
			});
		}
	}

	// Rename _id to id
	_note.id = _note._id;
	delete _note._id;

	delete _note.prev;
	delete _note.next;
	delete _note.tagsLower;
	delete _note.mecabWords;
	delete _note.trendWords;
	delete _note._user;
	delete _note._reply;
	delete _note._renote;
	delete _note._files;
	delete _note._replyIds;
	delete _note.mentionedRemoteUsers;

	if (_note.geo) delete _note.geo.type;

	// Populate user
	_note.user = packUser(_note.userId, meId);

	// Populate app
	if (_note.appId) {
		_note.app = packApp(_note.appId);
	}

	// Populate files
	_note.files = packFileMany(_note.fileIds || []);

	// 後方互換性のため
	_note.mediaIds = _note.fileIds;
	_note.media = _note.files;

	// When requested a detailed note data
	if (opts.detail) {
		if (_note.replyId) {
			// Populate reply to note
			_note.reply = pack(_note.replyId, meId, {
				detail: false
			});
		}

		if (_note.renoteId) {
			// Populate renote
			_note.renote = pack(_note.renoteId, meId, {
				detail: _note.text == null
			});
		}

		// Poll
		if (meId && _note.poll) {
			_note.poll = (async poll => {
				if (poll.multiple) {
					const votes = await PollVote.find({
						userId: meId,
						noteId: id
					});

					const myChoices = (poll.choices as IChoice[]).filter(x => votes.some(y => x.id == y.choice));
					for (const myChoice of myChoices) {
						(myChoice as any).isVoted = true;
					}

					return poll;
				} else {
					poll.multiple = false;
				}

				const vote = await PollVote
					.findOne({
						userId: meId,
						noteId: id
					});

				if (vote) {
					const myChoice = (poll.choices as IChoice[])
						.filter(x => x.id == vote.choice)[0] as any;

					myChoice.isVoted = true;
				}

				return poll;
			})(_note.poll);
		}

		if (meId) {
			// Fetch my reaction
			_note.myReaction = (async () => {
				const reaction = await NoteReaction
					.findOne({
						userId: meId,
						noteId: id,
						deletedAt: { $exists: false }
					});

				if (reaction) {
					return decodeReaction(reaction.reaction);
				}

				return null;
			})();

			// Fetch my renote
			_note.myRenoteId = (async () => {
				const renote = await Note.findOne({
					userId: meId,
					renoteId: _note.id,
					text: null,
					poll: null,
					'fileIds.0': { $exists: false },
					deletedAt: { $exists: false }
				}, {
					_id: 1
				});

				return renote ? renote._id : null;
			})();
		}
	}

	// resolve promises in _note object
	_note = await rap(_note);

	//#region (データベースの欠損などで)参照しているデータがデータベース上に見つからなかったとき
	if (_note.user == null) {
		dbLogger.warn(`[DAMAGED DB] (missing) pkg: note -> user :: ${_note.id} (user ${_note.userId})`);
		return null;
	}

	if (opts.detail) {
		if (_note.replyId != null && _note.reply == null) {
			dbLogger.warn(`[DAMAGED DB] (missing) pkg: note -> reply :: ${_note.id} (reply ${_note.replyId})`);
			return null;
		}

		if (_note.renoteId != null && _note.renote == null) {
			dbLogger.warn(`[DAMAGED DB] (missing) pkg: note -> renote :: ${_note.id} (renote ${_note.renoteId})`);
			return null;
		}
	}
	//#endregion

	if (_note.user.isCat && _note.text) {
		try {
			const tokens = _note.text ? parse(_note.text) : [];
			_note.text = toString(tokens, { doNyaize: true });
		} catch (e) {
			console.log(e);
		}
	}

	if (_note.name && (_note.url || _note.uri)) {
		_note.text = `【${_note.name}】\n${(_note.text || '').trim()}\n\n${_note.url || _note.uri}`;
	}

	if (!opts.skipHide) {
		await hideNote(_note, meId);
	}

	return _note;
};
