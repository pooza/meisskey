"use strict";(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[8853],{88853:(e,t,s)=>{s.r(t),s.d(t,{default:()=>a});var n=s(31508),o=s(46813),i=s(56569),r=s(80533),u=s(32971);const l=n.ZP.extend({i18n:(0,o.Z)(),components:{XColumn:i.Z,XNotes:r.Z},data(){return{faThumbsUp:u.u8Q,makePromise:e=>this.$root.api("i/reactions",{limit:11,untilId:e||void 0}).then((e=>{const t=e.map((e=>e.note));return 11==t.length?(t.pop(),{notes:t,cursor:e[t.length-1].id}):{notes:t,cursor:null}}))}},methods:{focus(){this.$refs.timeline.focus()}}});const a=(0,s(26385).Z)(l,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("x-column",{scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:e.faThumbsUp}}),e._v(e._s(e.$t("@.noteReactions"))+"\n\t")]},proxy:!0}])},[t("div",[t("x-notes",{ref:"timeline",attrs:{"make-promise":e.makePromise},on:{inited:()=>e.$emit("loaded")}})],1)])}),[],!1,null,null,null).exports}}]);