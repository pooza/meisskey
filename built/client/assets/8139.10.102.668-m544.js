(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[8139],{56889:(t,e,s)=>{var i=s(11063),n=s(26143)(i);n.push([t.id,"main>.signed-in-as[data-v-7343b5bd]{font-weight:700}main>.signed-in-as[data-v-7343b5bd],main>.signout[data-v-7343b5bd]{background:var(--mobileSignedInAsBg);border-radius:6px;box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);color:var(--mobileSignedInAsFg);margin:16px;padding:16px;text-align:center}main>footer[data-v-7343b5bd]{color:var(--text);margin:16px;opacity:.7;text-align:center}",""]),t.exports=n},88139:(t,e,s)=>{"use strict";s.r(e),s.d(e,{default:()=>d});var i=s(31508),n=s(46813),a=s(84198),o=s(87114);const r=i.ZP.extend({i18n:(0,n.Z)("mobile/views/pages/settings.vue"),components:{XSettings:a.Z},data:()=>({version:o.i8,codename:o.VY}),computed:{name(){return i.ZP.filter("userName")(this.$store.state.i)}},mounted(){document.title=this.$root.instanceName},methods:{signout(){this.$root.signout()}}});s(82814);const d=(0,s(26385).Z)(r,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("mk-ui",{scopedSlots:t._u([{key:"header",fn:function(){return[e("span",{staticStyle:{"margin-right":"4px"}},[e("fa",{attrs:{icon:"cog"}})],1),t._v(t._s(t.$t("@.settings")))]},proxy:!0}])},[e("main",[e("div",{staticClass:"signed-in-as"},[e("mfm",{attrs:{text:t.$t("signed-in-as").replace("{}",t.name),plain:!0,"custom-emojis":t.$store.state.i.emojis}})],1),e("x-settings"),e("div",{staticClass:"signout",on:{click:t.signout}},[t._v(t._s(t.$t("@.signout")))]),e("footer",[e("small",[t._v("ver "+t._s(t.version)+" ("+t._s(t.codename)+")")])])],1)])}),[],!1,null,"7343b5bd",null).exports},82814:(t,e,s)=>{var i=s(56889);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);(0,s(80950).Z)("0e8a26c2",i,!0,{})}}]);