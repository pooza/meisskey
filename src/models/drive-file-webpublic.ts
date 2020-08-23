import * as mongo from 'mongodb';
import db, { nativeDbConn } from '../db/mongodb';

const DriveFileWebpublic = db.get<IDriveFileWebpublic>('driveFileWebpublics.files');
DriveFileWebpublic.createIndex('metadata.originalId', { sparse: true, unique: true });
export default DriveFileWebpublic;

export const DriveFileWebpublicChunk = db.get('driveFileWebpublics.chunks');

export const getDriveFileWebpublicBucket = async (): Promise<mongo.GridFSBucket> => {
	const db = await nativeDbConn();
	const bucket = new mongo.GridFSBucket(db, {
		bucketName: 'driveFileWebpublics'
	});
	return bucket;
};

export type IMetadata = {
	originalId: mongo.ObjectID;
};

export type IDriveFileWebpublic = {
	_id: mongo.ObjectID;
	uploadDate: Date;
	md5: string;
	filename: string;
	contentType: string;
	metadata: IMetadata;
};
