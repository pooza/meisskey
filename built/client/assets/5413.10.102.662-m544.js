"use strict";(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[5413],{5413:(t,s,e)=>{e.r(s),e.d(s,{default:()=>u});var n=e(31508),i=e(46813);const o=n.ZP.extend({i18n:(0,i.Z)("mobile/views/pages/user-lists.vue"),data:()=>({fetching:!0,lists:[]}),components:{XLists:()=>e.e(1294).then(e.bind(e,61294)).then((t=>t.default))},mounted(){document.title=this.$t("title")},methods:{choosen(t){t&&this.$router.push(`/i/lists/${t.id}`)}}});const u=(0,e(26385).Z)(o,(function(){var t=this,s=t._self._c;t._self._setupProxy;return s("mk-ui",{scopedSlots:t._u([{key:"header",fn:function(){return[s("fa",{attrs:{icon:"list"}}),t._v(t._s(t.$t("title")))]},proxy:!0},{key:"func",fn:function(){return[s("button",{on:{click:function(s){return t.$refs.lists.add()}}},[s("fa",{attrs:{icon:"plus"}})],1)]},proxy:!0}])},[s("x-lists",{ref:"lists",on:{choosen:t.choosen}})],1)}),[],!1,null,null,null).exports}}]);