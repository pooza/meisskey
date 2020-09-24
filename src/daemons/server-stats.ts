import * as os from 'os';
import * as systeminformation from 'systeminformation';
import * as diskusage from 'diskusage';
import * as Deque from 'double-ended-queue';
import Xev from 'xev';
import * as osUtils from 'os-utils';

const ev = new Xev();

const interval = 3000;

/**
 * Report server stats regularly
 */
export default function() {
	const log = new Deque<any>();

	ev.on('requestServerStatsLog', x => {
		ev.emit(`serverStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
	});

	async function tick() {
		const cpu = await cpuUsage();
		const usedmem = await usedMem();
		const totalmem = await totalMem();
		const disk = await diskusage.check(os.platform() == 'win32' ? 'c:' : '/');

		const stats = {
			cpu_usage: cpu,
			mem: {
				total: totalmem,
				used: usedmem
			},
			disk,
			os_uptime: -1,
			process_uptime: -1
		};
		ev.emit('serverStats', stats);
		log.unshift(stats);
		if (log.length > 200) log.pop();
	}

	tick();

	setInterval(tick, interval);
}

// CPU STAT
function cpuUsage() {
	return new Promise((res, rej) => {
		try {
			osUtils.cpuUsage((cpuUsage: number) => {
				res(cpuUsage);
			});
		} catch (e) {
			rej(e);
		}
	});
}

// MEMORY(excl buffer + cache) STAT
async function usedMem() {
	const data = await systeminformation.mem();
	return data.active;
}

// TOTAL MEMORY STAT
async function totalMem() {
	const data = await systeminformation.mem();
	return data.total;
}
