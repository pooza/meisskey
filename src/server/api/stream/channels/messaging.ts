import autobind from 'autobind-decorator';
import read from '../../common/read-messaging-message';
import Channel from '../channel';
import User, { IUser } from '../../../../models/user';

export default class extends Channel {
	public readonly chName = 'messaging';
	public static requireCredential = true;

	private otherpartyId: string;
	private otherparty: IUser;

	@autobind
	public async init(params: any) {
		this.otherpartyId = params.otherparty as string;
		this.otherparty = await User.findOne({ _id: this.otherpartyId});

		// Subscribe messaging stream
		this.subscriber.on(`messagingStream:${this.user._id}-${this.otherpartyId}`, data => {
			this.send(data);
		});
	}

	@autobind
	public onMessage(type: string, body: any) {
		switch (type) {
			case 'read':
				read(this.user._id, this.otherpartyId, body.id);
				break;
		}
	}
}
