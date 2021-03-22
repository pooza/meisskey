import Note, { INote, packMany } from '../../../models/note';
import { ILocalUser } from '../../../models/user';

export async function getPackedTimeline(me: ILocalUser | null, query: any, sort: Record<string, number>, limit: number) {
	const timeline = await Note.aggregate<INote[]>([
		{
			$match: query
		}, {
			$sort: sort
		}, {
			$limit: limit
		}, {
			$lookup: {
				from: 'users',
				let: { userId: '$userId' },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: [ '$_id', '$$userId' ]
							}
						}
					}, {
						$project: {
							name: true,
							username: true,
							host: true,
							avatarId: true,
							emojis: true,
							isCat: true,
							isBot: true,
							isAdmin: true,
						}	// $project in pipeline
					}
				],	// pipeline
				as: '__user',
			}	// $lookup
		}, {
			$unwind: {
				path: '$__user'
			}
		}
	],	// aggregates
	{
		maxTimeMS: 25000,
	});

	return await packMany(timeline, me);
}
