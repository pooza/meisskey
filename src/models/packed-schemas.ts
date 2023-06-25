
export type ThinPackedNote = {
	id: string;
	createdAt: string | null;
	deletedAt: string | null;
	updatedAt: string | null;
	text: string | null
	cw: string | null;
	userId: string;
	user: ThinPackedUser | null;
	replyId: string | null;
	renoteId: string | null;
	viaMobile: boolean;
	visibility: string;
	tags: string[];
	localOnly: boolean;
	copyOnce: boolean;
	score: number;
	renoteCount: number;
	quoteCount: number;
	repliesCount: number;
	reactions: Record<string, number>;	// Forward Compatibility
	reactionCounts: Record<string, number>;
	emojis: {
		name: string;
		url: string;
	}[];
	fileIds: string[];
	files: any;	// TODO
	uri: string | null;
	url: string | null;
	appId: string | null;
	app: any | null;	// TODO

	visibleUserIds: string[];
	mentions: string[];
	hasRemoteMentions: boolean;

	notHaveDecorationMfm?: boolean;

	isHidden?: boolean;
}

export type PackedNote = ThinPackedNote & {
	reply?: ThinPackedNote | null;
	renote?: PackedNote | null;
	references?: PackedNote[];
	poll?: any | null;	// TODO
	myReaction?: string | null;
	myRenoteId?: string | null;
};

export type ThinPackedUser = {
	id: string;
	username: string;
	name: string | null;
	host: string | null;
	avatarUrl: string | null;
	avatarColor: string | null;
	isAdmin: boolean;
	isVerified?: boolean;
	borderColor?: string | null;
	isBot: boolean;
	isCat: boolean;
	instance: any;	// TODO
	avoidSearchIndex?: boolean;
	tags: string[];
	url?: string | null;
	uri?: string | null;
	emojis: {
		name: string;
		url: string;
	}[];
};

export type PackedUser = ThinPackedUser & {
	createdAt?: string | null;
	updatedAt?: string | null;
	bannerUrl?: string | null;
	bannerColor?: string | null;
	isLocked?: boolean;
	isSilenced?: boolean;
	isSuspended?: boolean;
	isDeleted?: boolean;
	description?: string | null;
	profile?: {
		birthday?: string | null;
		location?: string | null;
	};
	fields?: {
		name: string;
		value: string;
	}[];
	followersCount?: number | null;
	followingCount?: number | null;
	notesCount?: number;
	pinnedNoteIds?: string[];
	pinnedNotes?: PackedNote[]
	movedToUser?: ThinPackedUser | null;
	usertags?: string[];

	// local
	isModerator?: boolean;
	twoFactorEnabled?: boolean;
	twitter?: {
		screenName: string;
		userId: string;
	};
	github?: {
		id: string;
		login: string;
	};
	discord?: {
		id: string;
		global_name?: string;
		username: string;
		discriminator: string;
	};

	// my
	avatarId?: string | null;
	bannerId?: string | null;
	alwaysMarkNsfw?: boolean;
	carefulBot?: boolean;
	carefulRemote?: boolean;
	carefulMassive?: boolean;
	refuseFollow?: boolean;
	autoAcceptFollowed?: boolean;
	isExplorable?: boolean;
	searchableBy?: string;
	hideFollows?: string;
	wallpaperId?: string | null;
	wallpaperUrl?: string | null;
	hasUnreadMessagingMessage?: boolean;
	hasUnreadNotification?: boolean;
	hasUnreadSpecifiedNotes?: boolean;
	hasUnreadMentions?: boolean;
	pendingReceivedFollowRequestsCount?: number;

	// my secrets
	email?: string | null;
	emailVerified?: boolean;
	clientSettings?: any;
	settings?: {
		autoWatch: boolean;
		alwaysMarkNsfw?: boolean;
		pushNotifications?: Record<string, boolean | undefined>;
	};

	// other
	isFollowing?: boolean;
	isFollowed?: boolean;
	hasPendingFollowRequestFromYou?: boolean;
	hasPendingFollowRequestToYou?: boolean;
	isBlocking?: boolean;
	isBlocked?: boolean;
	isMuted?: boolean;
	isHideRenoting?: boolean;

	/*
	movedToUserId?: string | null;
	autoWatch?: boolean;
	hasUnreadAnnouncement?: boolean;
	*/
}

//#region Follow
export type PackedFollowBase = {
	/** Relation ID */
	id: string;
	/** フォローの作成日時 */
	createdAt: string | null;
	/** フォローされたユーザーのID */
	followeeId: string;
	/** フォローしたユーザーのID */
	followerId: string;
}

export type PackedFollowee = PackedFollowBase & {
	/** フォローされたユーザーのオブジェクト */
	followee: PackedUser;
};

export type PackedFollower = PackedFollowBase & {
	/** フォローしているユーザーのオブジェクト */
	follower: PackedUser;
};

export type V10Followees = {
	/** フォローしているユーザーのオブジェクト */
	users: PackedUser[];
	/** 返した中で最後のRelation ID (nextという名前だけどnextではない！) */
	next: string
}

export type V10Followers = {
	/** フォローされたユーザーのオブジェクト */
	users: PackedUser[];
	/** 返した中で最後のRelation ID (nextという名前だけどnextではない！) */
	next: string
}
//#endregion

export type PackedNotification = PackedBasicNotification | PackedNoteNotification | PackedMessageNotification | PackedReactionNotification | PackedVoteNotification;

type PackedNotificationBase = {
	id: string;
	createdAt: string;
	isRead: boolean;
	user: ThinPackedUser;
	userId: string;
};

type PackedBasicNotification = PackedNotificationBase & {
	type: 'follow' | 'receiveFollowRequest';
};

type PackedNoteNotification = PackedNotificationBase & {
	type: 'mention' | 'reply' | 'renote' | 'quote' | 'highlight' | 'poll_finished';
	/** Note (mention/reply/renote/quoteの場合は相手のNote) */
	note: PackedNote | null;
};

type PackedMessageNotification = PackedNotificationBase & {
	type: 'unreadMessagingMessage';
	message: any | null;
};

type PackedReactionNotification = PackedNotificationBase & {
	type: 'reaction';
	note: PackedNote | null;
	reaction: string | null;
};

type PackedVoteNotification = PackedNotificationBase & {
	type: 'poll_vote';
	note: PackedNote | null;
	choice: number | null;
};

export type packedInvitation = {
	id: string;
	inviterId?: string;
	inviteeIds?: string[];
	createdAt: string;
	expiredAt?: string;
	code: string;
	inviter?: ThinPackedUser | null;
	invitees?: (ThinPackedUser | null)[];
	restCount?: number;
};
