(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[389],{22853:(t,e,s)=>{var a=s(11063),o=s(26143)(a);o.push([t.id,".serchbox24>.line[data-v-aac23cf0]{display:flex}.serchbox24>.line>input[data-v-aac23cf0]{background:var(--desktopHeaderSearchBg);border:none;border-radius:8px;color:var(--desktopHeaderSearchFg);font-size:1em;height:2em;padding:.5em;transition:color .5s ease,border .5s ease,width .5s ease,background .5s ease;width:100%}.serchbox24>.line>input[data-v-aac23cf0]::placeholder{color:var(--desktopHeaderFg)}.serchbox24>.line>input[data-v-aac23cf0]:hover{background:var(--desktopHeaderSearchHoverBg)}.serchbox24>.line>input[data-v-aac23cf0]:focus{background:var(--bg);box-shadow:0 0 0 2px var(--primaryAlpha05)!important}.serchbox24>.line>button[data-v-aac23cf0]{color:var(--text);margin:6px}",""]),t.exports=o},13814:(t,e,s)=>{var a=s(11063),o=s(26143)(a);o.push([t.id,".search-area[data-v-7f3a6742]{margin-bottom:24px;padding:0 10%}",""]),t.exports=o},52239:(t,e,s)=>{"use strict";s.d(e,{Z:()=>i});var a=s(31508),o=s(46813);const r=a.ZP.extend({i18n:(0,o.Z)("desktop/views/components/ui.header.search.vue"),props:{word:{type:String}},data(){return{q:this.word,wait:!1}},methods:{async onSubmit(){if(this.wait)return;const t=this.q.trim();if(t.startsWith("@"))this.$router.push(`/${t}`);else if(t.startsWith("#"))this.$router.push(`/tags/${encodeURIComponent(t.substr(1))}`);else if(t.startsWith("https://")){this.wait=!0;try{const e=await this.$root.api("ap/show",{uri:t});"User"==e.type?this.$router.push(`/@${e.object.username}${e.object.host?`@${e.object.host}`:""}`):"Note"==e.type?this.$router.push(`/notes/${e.object.id}`):"Emoji"==e.type&&this.$root.dialog({type:"success",text:`:${e.object.name}:`,mfmCustomEmojis:[e.object]})}catch(t){}this.wait=!1}else this.$router.push(`/search?q=${encodeURIComponent(t)}`)}}});s(94884);const i=(0,s(26385).Z)(r,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("form",{staticClass:"serchbox24",on:{submit:function(e){return e.preventDefault(),t.onSubmit.apply(null,arguments)}}},[e("div",{staticClass:"line"},[e("input",{directives:[{name:"model",rawName:"v-model",value:t.q,expression:"q"},{name:"autocomplete",rawName:"v-autocomplete",value:{model:"q",noEmoji:!0},expression:"{ model: 'q', noEmoji: true }"}],attrs:{type:"search",placeholder:t.$t("placeholder")},domProps:{value:t.q},on:{input:function(e){e.target.composing||(t.q=e.target.value)}}}),e("button",{attrs:{type:"submit"}},[e("fa",{attrs:{icon:"search"}})],1)]),e("div",{staticClass:"result"})])}),[],!1,null,"aac23cf0",null).exports},70389:(t,e,s)=>{"use strict";s.r(e),s.d(e,{default:()=>c});var a=s(31508),o=s(46813),r=s(87186),i=s(52239);const n=a.ZP.extend({i18n:(0,o.Z)("mobile/views/pages/tag.vue"),components:{XSearchBox:i.Z},data(){return{connection:null,makePromise:t=>this.$root.api("notes/search-by-tag",{limit:21,offset:t||void 0,tag:this.$route.params.tag},!1,!this.$store.getters.isSignedIn).then((e=>21==e.length?(e.pop(),{notes:e,cursor:t?t+20:20}):{notes:e,cursor:null}))}},created(){this.connection=this.$root.stream.connectToChannel("hashtag",{q:[[this.$route.params.tag]]}),this.connection.on("note",(t=>{this.$refs.timeline.prepend(t)}))},beforeDestroy(){this.connection.dispose()},watch:{$route(){this.$refs.timeline.reload()}},methods:{fn(){this.$post()},inited(){r.Z.done()}}});s(30319);const c=(0,s(26385).Z)(n,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("mk-ui",{scopedSlots:t._u([{key:"header",fn:function(){return[e("span",{staticStyle:{"margin-right":"4px"}},[e("fa",{attrs:{icon:"hashtag"}})],1),t._v(t._s(t.$route.params.tag))]},proxy:!0},{key:"func",fn:function(){return[e("button",{on:{click:t.fn}},[e("fa",{attrs:{icon:"pencil-alt"}})],1)]},proxy:!0}])},[e("main",[e("div",{staticClass:"search-area"},[e("x-search-box",{attrs:{word:`#${t.$route.params.tag}`}})],1),t.$store.getters.isSignedIn?e("mk-post-form",{staticClass:"form",attrs:{fixedTag:t.$route.params.tag}}):t._e(),e("mk-notes",{ref:"timeline",attrs:{"make-promise":t.makePromise},on:{inited:t.inited}})],1)])}),[],!1,null,"7f3a6742",null).exports},94884:(t,e,s)=>{var a=s(22853);a.__esModule&&(a=a.default),"string"==typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);(0,s(80950).Z)("7e978b2e",a,!0,{})},30319:(t,e,s)=>{var a=s(13814);a.__esModule&&(a=a.default),"string"==typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);(0,s(80950).Z)("5b6ad1fa",a,!0,{})}}]);