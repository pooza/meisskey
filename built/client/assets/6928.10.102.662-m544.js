(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[6928],{76768:(e,t,a)=>{var o=a(11063),s=a(26143)(o);s.push([e.id,".tagtl513 header[data-v-4fe11faa]{background:var(--face);color:var(--faceHeaderText);font-weight:700;padding:.7em;text-align:center}.tagtl513 .form[data-v-4fe11faa],.tagtl513 header[data-v-4fe11faa]{border-radius:6px;margin-bottom:16px}.tagtl513 .form[data-v-4fe11faa]{box-shadow:0 3px 8px rgba(0,0,0,.2)}",""]),e.exports=s},76928:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>i});var o=a(31508),s=a(46813),n=a(87186);const r=o.ZP.extend({i18n:(0,s.Z)("desktop/views/pages/tag.vue"),data(){return{connection:null,makePromise:e=>this.$root.api("notes/search-by-tag",{limit:21,offset:e||void 0,tag:this.$route.params.tag},!1,!this.$store.getters.isSignedIn).then((t=>21==t.length?(t.pop(),{notes:t,cursor:e?e+20:20}):{notes:t,cursor:null}))}},created(){this.connection=this.$root.stream.connectToChannel("hashtag",{q:[[this.$route.params.tag]]}),this.connection.on("note",(e=>{this.$refs.timeline.prepend(e)}))},beforeDestroy(){this.connection.dispose()},watch:{$route(){this.$refs.timeline.reload()}},mounted(){document.addEventListener("keydown",this.onDocumentKeydown),window.addEventListener("scroll",this.onScroll,{passive:!0}),n.Z.start()},beforeDestroy(){document.removeEventListener("keydown",this.onDocumentKeydown),window.removeEventListener("scroll",this.onScroll)},methods:{onDocumentKeydown(e){"INPUT"!=e.target.tagName&&"TEXTAREA"!=e.target.tagName&&84==e.which&&this.$refs.timeline.focus()},inited(){n.Z.done()}}});a(67544);const i=(0,a(26385).Z)(r,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"tagtl513"},[t("header",[e._v(e._s(`#${e.$route.params.tag}`))]),e.$store.getters.isSignedIn?t("mk-post-form",{staticClass:"form",attrs:{fixedTag:e.$route.params.tag}}):e._e(),t("mk-notes",{ref:"timeline",attrs:{"make-promise":e.makePromise},on:{inited:e.inited}})],1)}),[],!1,null,"4fe11faa",null).exports},67544:(e,t,a)=>{var o=a(76768);o.__esModule&&(o=o.default),"string"==typeof o&&(o=[[e.id,o,""]]),o.locals&&(e.exports=o.locals);(0,a(80950).Z)("7cb39f60",o,!0,{})}}]);