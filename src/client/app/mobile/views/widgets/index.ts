import Vue from 'vue';

Vue.component('mkw-activity', () => import('./activity.vue').then(m => m.default));
Vue.component('mkw-profile', () => import('./profile.vue').then(m => m.default));
