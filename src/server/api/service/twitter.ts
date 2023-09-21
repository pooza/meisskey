import * as Router from '@koa/router';
import { v4 as uuid } from 'uuid';
import autwh from 'autwh';
import redis from '../../../db/redis';
import User, { pack, ILocalUser } from '../../../models/user';
import { publishMainStream } from '../../../services/stream';
import config from '../../../config';
import signin from '../common/signin';
import fetchMeta from '../../../misc/fetch-meta';

function getUserToken(ctx: Router.RouterContext) {
	return ((ctx.headers['cookie'] || '').match(/i=(!\w+)/) || [null, null])[1];
}

function compareOrigin(ctx: Router.RouterContext) {
	function normalizeUrl(url: string) {
		return url.endsWith('/') ? url.substr(0, url.length - 1) : url;
	}

	const referer = ctx.headers['referer'];

	return (normalizeUrl(referer) == normalizeUrl(config.url));
}

// Init router
const router = new Router();

router.get('/disconnect/twitter', async ctx => {
	if (!compareOrigin(ctx)) {
		ctx.throw(400, 'invalid origin');
		return;
	}

	const userToken = getUserToken(ctx);
	if (userToken == null) {
		ctx.throw(400, 'signin required');
		return;
	}

	const user = await User.findOneAndUpdate({
		host: null,
		'token': userToken
	}, {
		$set: {
			'twitter': null
		}
	});

	ctx.body = `Twitterの連携を解除しました :v:`;

	// Publish i updated event
	publishMainStream(user._id, 'meUpdated', await pack(user, user, {
		detail: true,
		includeSecrets: true
	}));
});

async function getTwAuth() {
	const meta = await fetchMeta();

	if (meta.enableTwitterIntegration) {
		return autwh({
			consumerKey: meta.twitterConsumerKey,
			consumerSecret: meta.twitterConsumerSecret,
			callbackUrl: `${config.url}/api/tw/cb`
		});
	} else {
		return null;
	}
}

router.get('/connect/twitter', async ctx => {
	if (!compareOrigin(ctx)) {
		ctx.throw(400, 'invalid origin');
		return;
	}

	const userToken = getUserToken(ctx);
	if (userToken == null) {
		ctx.throw(400, 'signin required');
		return;
	}

	const twAuth = await getTwAuth();
	const twCtx = await twAuth.begin();
	redis.set(userToken, JSON.stringify(twCtx));
	ctx.redirect(twCtx.url);
});

router.get('/signin/twitter', async ctx => {
	const twAuth = await getTwAuth();
	const twCtx = await twAuth.begin();

	const sessid = uuid();

	redis.set(sessid, JSON.stringify(twCtx));

	ctx.cookies.set('signin_with_twitter_sid', sessid, {
		path: '/',
		secure: config.url.startsWith('https'),
		httpOnly: true
	});
	// Cache-Controlは/api/でprivateになっている

	ctx.redirect(twCtx.url);
});

router.get('/tw/cb', async ctx => {
	const userToken = getUserToken(ctx);

	const twAuth = await getTwAuth();

	if (userToken == null) {
		const sessid = ctx.cookies.get('signin_with_twitter_sid');

		if (sessid == null) {
			ctx.throw(400, 'invalid session');
			return;
		}

		const get = new Promise<any>((res, rej) => {
			redis.get(sessid, async (_, twCtx) => {
				res(twCtx);
			});
		});

		const twCtx = await get;

		const result = await twAuth.done(JSON.parse(twCtx), ctx.query.oauth_verifier);

		const user = await User.findOne({
			host: null,
			'twitter.userId': result.userId
		}) as ILocalUser;

		if (user == null) {
			ctx.throw(404, `@${result.screenName}と連携しているMisskeyアカウントはありませんでした...`);
			return;
		}

		signin(ctx, user, true);
	} else {
		const verifier = ctx.query.oauth_verifier;

		if (verifier == null) {
			ctx.throw(400, 'invalid session');
			return;
		}

		const get = new Promise<any>((res, rej) => {
			redis.get(userToken, async (_, twCtx) => {
				res(twCtx);
			});
		});

		const twCtx = await get;

		const result = await twAuth.done(JSON.parse(twCtx), verifier);

		const user = await User.findOneAndUpdate({
			host: null,
			token: userToken
		}, {
			$set: {
				twitter: {
					accessToken: result.accessToken,
					accessTokenSecret: result.accessTokenSecret,
					userId: result.userId,
					screenName: result.screenName
				}
			}
		});

		ctx.body = `Twitter: @${result.screenName} を、Misskey: @${user.username} に接続しました！`;

		// Publish i updated event
		publishMainStream(user._id, 'meUpdated', await pack(user, user, {
			detail: true,
			includeSecrets: true
		}));
	}
});

export default router;
