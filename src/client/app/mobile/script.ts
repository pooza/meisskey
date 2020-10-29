/**
 * Mobile Client
 */

import Vue from 'vue';
import VueRouter from 'vue-router';

// Style
import './style.styl';

import init from '../init';

import MkIndex from './views/pages/index.vue';
import MkDeck from '../common/views/deck/deck.vue';
import MkSignup from './views/pages/signup.vue';
import MkSelectDrive from './views/pages/selectdrive.vue';
import MkDrive from './views/pages/drive.vue';
import MkWidgets from './views/pages/widgets.vue';
import MkMessaging from './views/pages/messaging.vue';
import MkMessagingRoom from './views/pages/messaging-room.vue';
import MkReceivedFollowRequests from './views/pages/received-follow-requests.vue';
import MkNote from './views/pages/note.vue';
import MkSearch from './views/pages/search.vue';
import MkFavorites from './views/pages/favorites.vue';
import MkReactions from './views/pages/reactions.vue';
import MkUserLists from './views/pages/user-lists.vue';
import MkUserList from './views/pages/user-list.vue';
import MkReversi from './views/pages/games/reversi.vue';
import MkTag from './views/pages/tag.vue';
import MkShare from '../common/views/pages/share.vue';
import MkFollow from '../common/views/pages/follow.vue';
import MkNotFound from '../common/views/pages/not-found.vue';

import PostForm from './views/components/post-form-dialog.vue';
import FileChooser from './views/components/drive-file-chooser.vue';
import FolderChooser from './views/components/drive-folder-chooser.vue';

import UI from './views/pages/ui.vue';
/**
 * init
 */
init((launch, os) => {
	Vue.mixin({
		data() {
			return {
				isMobile: true
			};
		},

		methods: {
			$post(opts) {
				const o = opts || {};

				document.documentElement.style.overflow = 'hidden';

				function recover() {
					document.documentElement.style.overflow = 'auto';
				}

				const vm = this.$root.new(PostForm, {
					reply: o.reply,
					airReply: o.airReply,
					mention: o.mention,
					renote: o.renote,
					initialText: o.initialText,
					instant: o.instant,
					initialNote: o.initialNote,
				});

				vm.$once('cancel', recover);
				vm.$once('posted', recover);
				if (o.cb) vm.$once('closed', o.cb);
				(vm as any).focus();
			},

			$chooseDriveFile(opts) {
				return new Promise((res, rej) => {
					const o = opts || {};
					const vm = this.$root.new(FileChooser, {
						title: o.title,
						multiple: o.multiple,
						initFolder: o.currentFolder
					});
					vm.$once('selected', file => {
						res(file);
					});
				});
			},

			$chooseDriveFolder(opts) {
				return new Promise((res, rej) => {
					const o = opts || {};
					const vm = this.$root.new(FolderChooser, {
						title: o.title,
						initFolder: o.currentFolder
					});
					vm.$once('selected', folder => {
						res(folder);
					});
				});
			},

			$notify(message) {
				alert(message);
			}
		}
	});

	// Register directives
	require('./views/directives');

	// Register components
	require('./views/components');
	require('./views/widgets');

	// http://qiita.com/junya/items/3ff380878f26ca447f85
	document.body.setAttribute('ontouchstart', '');

	// Init router
	const router = new VueRouter({
		mode: 'history',
		routes: [
			...(os.store.state.device.inDeckMode
				? [{ path: '/', name: 'index', component: MkDeck, children: [
					{ path: '/@:user', component: () => import('../common/views/deck/deck.user-column.vue').then(m => m.default), children: [
						{ path: '', name: 'user', component: () => import('../common/views/deck/deck.user-column.home.vue').then(m => m.default) },
						{ path: 'following', component: () => import('../common/views/pages/following.vue').then(m => m.default) },
						{ path: 'followers', component: () => import('../common/views/pages/followers.vue').then(m => m.default) },
					]},
					{ path: '/notes/:note', name: 'note', component: () => import('../common/views/deck/deck.note-column.vue').then(m => m.default) },
					{ path: '/search', component: () => import('../common/views/deck/deck.search-column.vue').then(m => m.default) },
					{ path: '/tags/:tag', name: 'tag', component: () => import('../common/views/deck/deck.hashtag-column.vue').then(m => m.default) },
					{ path: '/featured', name: 'featured', component: () => import('../common/views/deck/deck.featured-column.vue').then(m => m.default) },
					{ path: '/explore', name: 'explore', component: () => import('../common/views/deck/deck.explore-column.vue').then(m => m.default) },
					{ path: '/explore/tags/:tag', name: 'explore-tag', props: true, component: () => import('../common/views/deck/deck.explore-column.vue').then(m => m.default) },
					{ path: '/i/favorites', component: () => import('../common/views/deck/deck.favorites-column.vue').then(m => m.default) },
					{ path: '/i/reactions', component: () => import('../common/views/deck/deck.reactions-column.vue').then(m => m.default) },
					{ path: '/i/pages', name: 'pages', component: () => import('../common/views/pages/pages.vue').then(m => m.default) },
					{ path: '/@:username/pages/:pageName', name: 'page', props: true, component: () => import('../common/views/deck/deck.page-column.vue').then(m => m.default) },
				]}]
			: [
				{ path: '/', name: 'index', component: MkIndex },
		]),
			{ path: '/signup', name: 'signup', component: MkSignup },
			{ path: '/i/settings', name: 'settings', component: () => import('./views/pages/settings.vue').then(m => m.default) },
			{ path: '/i/settings/:page', redirect: '/i/settings' },
			{ path: '/i/favorites', name: 'favorites', component: MkFavorites },
			{ path: '/i/reactions', name: 'reactions', component: MkReactions },
			{ path: '/i/pages', name: 'pages', component: UI, props: route => ({ component: () => import('../common/views/pages/pages.vue').then(m => m.default) }) },
			{ path: '/i/lists', name: 'user-lists', component: MkUserLists },
			{ path: '/i/lists/:list', name: 'user-list', component: MkUserList },
			{ path: '/i/received-follow-requests', name: 'received-follow-requests', component: MkReceivedFollowRequests },
			{ path: '/i/widgets', name: 'widgets', component: MkWidgets },
			{ path: '/i/messaging', name: 'messaging', component: MkMessaging },
			{ path: '/i/messaging/:user', component: MkMessagingRoom },
			{ path: '/i/drive', name: 'drive', component: MkDrive },
			{ path: '/i/drive/folder/:folder', component: MkDrive },
			{ path: '/i/drive/file/:file', component: MkDrive },
			{ path: '/i/pages/new', component: UI, props: route => ({ component: () => import('../common/views/pages/page-editor/page-editor.vue').then(m => m.default) }) },
			{ path: '/i/pages/edit/:pageId', component: UI, props: route => ({ component: () => import('../common/views/pages/page-editor/page-editor.vue').then(m => m.default), initPageId: route.params.pageId }) },
	{ path: '/selectdrive', component: MkSelectDrive },
			{ path: '/search', component: MkSearch },
			{ path: '/tags/:tag', component: MkTag },
			{ path: '/featured', name: 'featured', component: () => import('./views/pages/featured.vue').then(m => m.default) },
			{ path: '/explore', name: 'explore', component: () => import('./views/pages/explore.vue').then(m => m.default) },
			{ path: '/explore/tags/:tag', name: 'explore-tag', props: true, component: () => import('./views/pages/explore.vue').then(m => m.default) },
			{ path: '/share', component: MkShare },
			{ path: '/games/reversi/:game?', name: 'reversi', component: MkReversi },
			{ path: '/@:user', name: 'user', component: () => import('./views/pages/user/index.vue').then(m => m.default), children: [
				{ path: 'following', component: () => import('../common/views/pages/following.vue').then(m => m.default) },
				{ path: 'followers', component: () => import('../common/views/pages/followers.vue').then(m => m.default) },
			]},
			{ path: '/@:user/pages/:page', component: UI, props: route => ({ component: () => import('../common/views/pages/page.vue').then(m => m.default), pageName: route.params.page, username: route.params.user }) },
			{ path: '/@:user/pages/:pageName/view-source', component: UI, props: route => ({ component: () => import('../common/views/pages/page-editor/page-editor.vue').then(m => m.default), initUser: route.params.user, initPageName: route.params.pageName }) },
			{ path: '/@:acct/room', props: true, component: () => import('../common/views/pages/room/room.vue').then(m => m.default) },
			{ path: '/notes/:note', component: MkNote },
			{ path: '/authorize-follow', component: MkFollow },
			{ path: '*', component: MkNotFound }
		]
	});

	// Launch the app
	launch(router);
}, true);
