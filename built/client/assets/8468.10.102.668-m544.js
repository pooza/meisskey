(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[8468],{59022:(e,t,i)=>{var s=i(11063),l=i(26143)(s);l.push([e.id,".mk-selectdrive[data-v-8346936c]{background:#fff;height:100%;width:100%}.mk-selectdrive>header[data-v-8346936c]{background:#fff;box-shadow:0 1px rgba(0,0,0,.1);left:0;position:fixed;top:0;width:100%;z-index:1000}.mk-selectdrive>header>h1[data-v-8346936c]{font-size:1em;font-weight:400;line-height:42px;margin:0;padding:0;text-align:center}.mk-selectdrive>header>h1>.count[data-v-8346936c]{margin-left:4px;opacity:.5}.mk-selectdrive>header>.upload[data-v-8346936c]{left:0;line-height:42px;position:absolute;top:0;width:42px}.mk-selectdrive>header>.ok[data-v-8346936c]{line-height:42px;position:absolute;right:0;top:0;width:42px}.mk-selectdrive>.mk-drive[data-v-8346936c]{top:42px}",""]),e.exports=l},78468:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>o});var s=i(31508),l=i(46813);const a=s.ZP.extend({i18n:(0,l.Z)("mobile/views/pages/selectdrive.vue"),components:{XDrive:()=>i.e(7588).then(i.bind(i,27588)).then((e=>e.default))},data:()=>({files:[]}),computed:{multiple:()=>"true"==new URL(location.toString()).searchParams.get("multiple")},mounted(){document.title=this.$t("title")},methods:{onSelected(e){this.files=[e],this.ok()},onChangeSelection(e){this.files=e},upload(){this.$refs.browser.selectLocalFile()},close(){window.close()},ok(){window.opener.cb(this.multiple?this.files:this.files[0]),this.close()}}});i(4221);const o=(0,i(26385).Z)(a,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"mk-selectdrive"},[t("header",[t("h1",[e._v(e._s(e.$t("select-file"))),e.files.length>0?t("span",{staticClass:"count"},[e._v("("+e._s(e.files.length)+")")]):e._e()]),t("button",{staticClass:"upload",on:{click:e.upload}},[t("fa",{attrs:{icon:"upload"}})],1),e.multiple?t("button",{staticClass:"ok",on:{click:e.ok}},[t("fa",{attrs:{icon:"check"}})],1):e._e()]),t("x-drive",{ref:"browser",attrs:{"select-file":"",multiple:e.multiple,"is-naked":"",top:e.$store.state.uiHeaderHeight}})],1)}),[],!1,null,"8346936c",null).exports},4221:(e,t,i)=>{var s=i(59022);s.__esModule&&(s=s.default),"string"==typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals);(0,i(80950).Z)("9ad3c90c",s,!0,{})}}]);