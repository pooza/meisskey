import * as redis from 'redis';
import config from '../config';
import { EventEmitter } from 'events';

let ev: EventEmitter;

export function getServerSubscriber() {
	if (!ev) setupServerEv();
	return ev;
}

function setupServerEv() {
	const subscriber = redis.createClient(
		config.redis.port,
		config.redis.host,
		{
			password: config.redis.pass
		}
	);

	subscriber.subscribe(config.host);

	ev = new EventEmitter();

	subscriber.on('message', async (_, data) => {
		const obj = JSON.parse(data);
		ev.emit(obj.channel, obj.message);
	});
}
