import * as Deque from 'double-ended-queue';
import Xev from 'xev';
import { deliverQueue, inboxQueue, inboxLazyQueue } from '../queue/queues';
import config from '../config';
import { getWorkerStrategies } from '..';
import { deliverJobConcurrency, inboxJobConcurrency, inboxLazyJobConcurrency } from '../queue';

const ev = new Xev();

const interval = 3000;

/**
 * Report queue stats regularly
 */
export default function() {
	const st = getWorkerStrategies(config);
	const workers = st.workers + st.queues || 1;

	const log = new Deque<any>();

	ev.on('requestQueueStatsLog', x => {
		ev.emit(`queueStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
	});

	let activeDeliverJobs = 0;
	let activeInboxJobs = 0;
	let activeInboxLazyJobs = 0;

	deliverQueue.on('global:active', () => {
		activeDeliverJobs++;
	});

	inboxQueue.on('global:active', () => {
		activeInboxJobs++;
	});

	inboxLazyQueue.on('global:active', () => {
		activeInboxLazyJobs++;
	});

	async function tick() {
		const deliverJobCounts = await deliverQueue.getJobCounts();
		const inboxJobCounts = await inboxQueue.getJobCounts();
		const inboxLazyJobCounts = await inboxLazyQueue.getJobCounts();

		const stats = {
			deliver: {
				limit: deliverJobConcurrency * workers,
				activeSincePrevTick: activeDeliverJobs,
				active: deliverJobCounts.active,
				waiting: deliverJobCounts.waiting,
				delayed: deliverJobCounts.delayed
			},
			inbox: {
				limit: inboxJobConcurrency * workers,
				activeSincePrevTick: activeInboxJobs,
				active: inboxJobCounts.active,
				waiting: inboxJobCounts.waiting,
				delayed: inboxJobCounts.delayed
			},
			inboxLazy: {
				limit: inboxLazyJobConcurrency * workers,
				activeSincePrevTick: activeInboxLazyJobs,
				active: inboxLazyJobCounts.active,
				waiting: inboxLazyJobCounts.waiting,
				delayed: inboxLazyJobCounts.delayed
			},
		};

		ev.emit('queueStats', stats);

		log.unshift(stats);
		if (log.length > 200) log.pop();

		activeDeliverJobs = 0;
		activeInboxJobs = 0;
		activeInboxLazyJobs = 0;
	}

	tick();

	setInterval(tick, interval);
}
