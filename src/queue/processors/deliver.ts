import * as Bull from 'bull';
import request from '../../remote/activitypub/request';
import { registerOrFetchInstanceDoc } from '../../services/register-or-fetch-instance-doc';
import Instance from '../../models/instance';
import instanceChart from '../../services/chart/instance';
import Logger from '../../services/logger';
import { UpdateInstanceinfo } from '../../services/update-instanceinfo';
import { isBlockedHost, isClosedHost } from '../../services/instance-moderation';
import { DeliverJobData } from '../types';
import { publishInstanceModUpdated } from '../../services/server-event';

const logger = new Logger('deliver');

let latest: string | null = null;

export default async (job: Bull.Job<DeliverJobData>) => {
	if (!job.data.to?.match(/^https?:/)) {
		return 'skip (invalid URL)';
	}

	const { host } = new URL(job.data.to);

	// ブロック/閉鎖してたら中断
	if (await isBlockedHost(host)) {
		return 'skip (blocked)';
	}
	if (await isClosedHost(host)) {
		return 'skip (closed)';
	}

	try {
		if (latest !== (latest = JSON.stringify(job.data.content, null, 2))) {
			logger.debug(`delivering ${latest}`);
		}

		await request(job.data.user, job.data.to, job.data.content);

		// Update stats
		registerOrFetchInstanceDoc(host).then(i => {
			Instance.update({ _id: i._id }, {
				$set: {
					latestRequestSentAt: new Date(),
					latestStatus: 200,
					lastCommunicatedAt: new Date(),
					isNotResponding: false
				}
			});

			UpdateInstanceinfo(i);

			instanceChart.requestSent(i.host, true);
		});

		return 'Success';
	} catch (res) {
		// Update stats
		registerOrFetchInstanceDoc(host).then(i => {
			Instance.update({ _id: i._id }, {
				$set: {
					latestRequestSentAt: new Date(),
					latestStatus: res != null && res.hasOwnProperty('statusCode') ? res.statusCode : null,
					isNotResponding: true
				}
			});

			instanceChart.requestSent(i.host, false);
		});

		if (res != null && res.hasOwnProperty('statusCode')) {
			// 4xx
			if (res.statusCode >= 400 && res.statusCode < 500) {
				// Mastodonから返ってくる401がどうもpermanent errorじゃなさそう
				if (res.statusCode === 401) {
					throw `${res.statusCode} ${res.statusMessage}`;
				}

				// sharedInboxで410を返されたら閉鎖済みとマークする
				if (res.statusCode === 410 && job.data.inboxInfo?.origin === 'sharedInbox') {
					logger.info(`${host}: MarkedAsClosed (sharedInbox:410)`);
					registerOrFetchInstanceDoc(host).then(i => {
						Instance.update({ _id: i._id }, {
							$set: {
								isMarkedAsClosed: true
							}
						}).then(() => {
							publishInstanceModUpdated();
						})
					});
				}

				// HTTPステータスコード4xxはクライアントエラーであり、それはつまり
				// 何回再送しても成功することはないということなのでエラーにはしないでおく
				return `${res.statusCode} ${res.statusMessage}`;
			}

			// 5xx etc.
			throw `${res.statusCode} ${res.statusMessage}`;
		} else {
			// DNS error, socket error, timeout ...
			throw res;
		}
	}
};
