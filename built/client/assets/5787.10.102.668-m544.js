(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[5787],{62293:(e,t,s)=>{var i=s(11063),a=s(26143)(i);a.push([e.id,".user-reactions[data-v-01cd6cd2]{color:var(--text)}.user-reactions[data-v-01cd6cd2] .items{display:flex;justify-content:center}.user-reactions[data-v-01cd6cd2] .items>.item{padding:.7em}.user-reactions[data-v-01cd6cd2] .items.deck>.item{padding:.3em}",""]),e.exports=a},1243:(e,t,s)=>{var i=s(11063),a=s(26143)(i);a.push([e.id,".lnctpgve>*[data-v-34019277]{margin-bottom:16px}",""]),e.exports=a},89361:(e,t,s)=>{var i=s(11063),a=s(26143)(i);a.push([e.id,".dzsuvbsrrrwobdxifudxuefculdfiaxd>.stream[data-v-24bd7f53]{background:var(--face);display:grid;gap:8px;grid-template-columns:1fr 1fr 1fr;padding:16px}.dzsuvbsrrrwobdxifudxuefculdfiaxd>.stream>*[data-v-24bd7f53]{background-clip:content-box;background-position:50%;background-size:cover;border-radius:4px;height:120px}.dzsuvbsrrrwobdxifudxuefculdfiaxd>.empty[data-v-24bd7f53],.dzsuvbsrrrwobdxifudxuefculdfiaxd>.initializing[data-v-24bd7f53]{color:var(--text);margin:0;padding:16px;text-align:center}.dzsuvbsrrrwobdxifudxuefculdfiaxd>.empty>i[data-v-24bd7f53],.dzsuvbsrrrwobdxifudxuefculdfiaxd>.initializing>i[data-v-24bd7f53]{margin-right:4px}",""]),e.exports=a},48462:(e,t,s)=>{var i=s(11063),a=s(26143)(i);a.push([e.id,'.command[data-v-4e4e545c]{margin:16px 0}.oh5y2r7l5lx8j6jj791ykeiwgihheguk[data-v-4e4e545c]{background:var(--faceHeader);padding:0 8px;z-index:10}.oh5y2r7l5lx8j6jj791ykeiwgihheguk>span[data-v-4e4e545c]{display:inline-block;font-size:12px;line-height:42px;padding:0 10px;user-select:none}.oh5y2r7l5lx8j6jj791ykeiwgihheguk>span[data-active][data-v-4e4e545c]{color:var(--primary);cursor:default;font-weight:700}.oh5y2r7l5lx8j6jj791ykeiwgihheguk>span[data-active][data-v-4e4e545c]:before{background:var(--primary);bottom:0;content:"";display:block;height:2px;left:-8px;position:absolute;width:calc(100% + 16px)}.oh5y2r7l5lx8j6jj791ykeiwgihheguk>span[data-v-4e4e545c]:not([data-active]){color:var(--desktopTimelineSrc);cursor:pointer}.oh5y2r7l5lx8j6jj791ykeiwgihheguk>span[data-v-4e4e545c]:not([data-active]):hover{color:var(--desktopTimelineSrcHover)}',""]),e.exports=a},94307:(e,t,s)=>{"use strict";s.d(t,{Z:()=>n});var i=s(31508),a=s(46813),r=s(32971);const o=i.ZP.extend({i18n:(0,a.Z)(""),props:{user:{type:Object,required:!0},deck:{type:Boolean,required:!1,default:!1}},data:()=>({reactionStats:null,faHeart:r.m6i}),created(){this.$root.api("users/reaction-stats",{userId:this.user.id,limit:10},!1,!0).then((e=>{this.reactionStats=e}))}});s(10908);const n=(0,s(26385).Z)(o,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",[t("ui-container",{staticClass:"user-reactions",attrs:{"body-togglable":!0,expanded:e.$store.state.device.expandUsersReactions},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersReactions",value:t})},scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:e.faHeart}}),e._v(" "+e._s(e.$t("@.favoriteReactions")))]},proxy:!0}])},[e.reactionStats?t("div",{staticClass:"items",class:{deck:e.deck}},e._l(e.reactionStats.reactions,(function(s){return t("div",{key:s.reaction,staticClass:"item",attrs:{title:s.count}},[t("mk-reaction-icon",{attrs:{reaction:s.reaction,customEmojis:e.reactionStats.emojis}})],1)})),0):e._e()]),t("ui-container",{staticClass:"user-reactions",attrs:{"body-togglable":!0,expanded:e.$store.state.device.expandUsersReacteds},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersReacteds",value:t})},scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:e.faHeart}}),e._v(" "+e._s(e.$t("@.mostReacteds")))]},proxy:!0}])},[e.reactionStats?t("div",{staticClass:"items",class:{deck:e.deck}},e._l(e.reactionStats.reacteds,(function(s){return t("div",{key:s.reaction,staticClass:"item",attrs:{title:s.count}},[t("mk-reaction-icon",{attrs:{reaction:s.reaction,customEmojis:e.reactionStats.emojis}})],1)})),0):e._e()])],1)}),[],!1,null,"01cd6cd2",null).exports},35787:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>y});var i=s(31508),a=s(46813),r=s(3123);const o=i.ZP.extend({i18n:(0,a.Z)("desktop/views/pages/user/user.timeline.vue"),props:["user"],data(){return{fetching:!0,mode:"default",unreadCount:0,date:null,faCalendarAlt:r.IV,makePromise:e=>this.$root.api("users/notes",{userId:this.user.id,limit:11,includeReplies:"with-replies"==this.mode||"with-media"==this.mode,includeMyRenotes:"my-posts"!=this.mode,withFiles:"with-media"==this.mode,untilId:!this.date&&e?e:void 0,untilDate:this.date?this.date.getTime():void 0},!1,!this.$store.getters.isSignedIn).then((e=>(this.date=null,11==e.length?(e.pop(),{notes:e,cursor:e[e.length-1].id}):{notes:e,cursor:null})))}},watch:{mode(){this.$refs.timeline.reload()}},mounted(){document.addEventListener("keydown",this.onDocumentKeydown)},beforeDestroy(){document.removeEventListener("keydown",this.onDocumentKeydown)},methods:{onDocumentKeydown(e){"INPUT"!==e.target.tagName&&"TEXTAREA"!==e.target.tagName&&84==e.which&&this.$refs.timeline.focus()},fetchOutbox(){this.$root.api("ap/fetch-outbox",{userId:this.user.id,sync:!0}).then((()=>{this.$refs.timeline.reload()}))},warp(e){this.date=e,this.$refs.timeline.reload()}}});s(62739);var n=s(26385);const d=(0,n.Z)(o,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{attrs:{id:"user_timeline_52"}},[t("ui-container",{attrs:{"body-togglable":!0,expanded:e.$store.state.device.expandUsersWarp},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersWarp",value:t})},scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:e.faCalendarAlt}}),e._v(" "+e._s(e.$t("@.timemachine")))]},proxy:!0}])},[t("mk-calendar",{on:{chosen:e.warp}})],1),t("div",{staticClass:"command"},[t("ui-button",{on:{click:function(t){return e.fetchOutbox()}}},[e._v(e._s(e.$t("fetch-posts")))])],1),t("mk-notes",{ref:"timeline",attrs:{"make-promise":e.makePromise},on:{inited:()=>e.$emit("loaded")},scopedSlots:e._u([{key:"header",fn:function(){return[t("header",{staticClass:"oh5y2r7l5lx8j6jj791ykeiwgihheguk"},[t("span",{attrs:{"data-active":"default"==e.mode},on:{click:function(t){e.mode="default"}}},[t("fa",{attrs:{icon:["far","comment-alt"]}}),e._v(" "+e._s(e.$t("default")))],1),t("span",{attrs:{"data-active":"with-replies"==e.mode},on:{click:function(t){e.mode="with-replies"}}},[t("fa",{attrs:{icon:"comments"}}),e._v(" "+e._s(e.$t("with-replies")))],1),t("span",{attrs:{"data-active":"with-media"==e.mode},on:{click:function(t){e.mode="with-media"}}},[t("fa",{attrs:{icon:["far","images"]}}),e._v(" "+e._s(e.$t("with-media")))],1),t("span",{attrs:{"data-active":"my-posts"==e.mode},on:{click:function(t){e.mode="my-posts"}}},[t("fa",{attrs:{icon:"user"}}),e._v(" "+e._s(e.$t("my-posts")))],1)])]},proxy:!0}])})],1)}),[],!1,null,"4e4e545c",null).exports;var c=s(59966),l=s(49733);const u=i.ZP.extend({i18n:(0,a.Z)("desktop/views/pages/user/user.photos.vue"),props:["user"],data:()=>({images:[],fetching:!0}),mounted(){const e=["image/jpeg","image/png","image/apng","image/gif","image/webp","image/avif"];this.$root.api("users/notes",{userId:this.user.id,fileType:e,excludeNsfw:!this.$store.state.device.alwaysShowNsfw,limit:9},!1,!this.$store.getters.isSignedIn).then((t=>{for(const e of t)for(const t of e.files)t._note=e;const s=(0,l.zo)(t.map((e=>e.files)));this.images=s.filter((t=>e.includes(t.type))).slice(0,9),this.fetching=!1}))},methods:{thumbnail(e){return this.$store.state.device.disableShowingAnimatedImages?(0,c.e)(e.thumbnailUrl):e.thumbnailUrl}}});s(75872);const p=(0,n.Z)(u,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("ui-container",{attrs:{"body-togglable":!0,expanded:e.$store.state.device.expandUsersPhotos},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersPhotos",value:t})},scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:"camera"}}),e._v(" "+e._s(e.$t("title")))]},proxy:!0}])},[t("div",{staticClass:"dzsuvbsrrrwobdxifudxuefculdfiaxd"},[e.fetching?t("p",{staticClass:"initializing"},[t("fa",{attrs:{icon:"spinner",pulse:"","fixed-width":""}}),e._v(e._s(e.$t("loading"))),t("mk-ellipsis")],1):e._e(),!e.fetching&&e.images.length>0?t("div",{staticClass:"stream"},e._l(e.images,(function(s){return t("router-link",{key:`${s.id}:${s._note.id}`,staticClass:"img",style:`background-image: url(${s.thumbnailUrl})`,attrs:{to:e._f("notePage")(s._note),title:`${s.name}\n${new Date(s.createdAt).toLocaleString()}`}})})),1):e._e(),e.fetching||0!=e.images.length?e._e():t("p",{staticClass:"empty"},[e._v(e._s(e.$t("no-photos")))])])])}),[],!1,null,"24bd7f53",null).exports;var m=s(6800),f=s.n(m);const h=i.ZP.extend({props:{user:{type:Object,required:!0},limit:{type:Number,required:!1,default:21}},data:()=>({fetching:!0,data:[],peak:null}),mounted(){this.$root.api("charts/user/notes",{userId:this.user.id,span:"day",limit:this.limit},!1,!0).then((e=>{const t=[],s=[],i=[],a=new Date,r=a.getFullYear(),o=a.getMonth(),n=a.getDate();for(let a=0;a<this.limit;a++){const d=new Date(r,o,n-a);t.push([d,e.diffs.normal[a]]),s.push([d,e.diffs.reply[a]]),i.push([d,e.diffs.renote[a]])}new(f())(this.$refs.chart,{chart:{type:"bar",stacked:!0,height:100,sparkline:{enabled:!0}},plotOptions:{bar:{columnWidth:"80%"}},grid:{clipMarkers:!1,padding:{top:0,right:8,bottom:0,left:8}},tooltip:{shared:!0,intersect:!1},series:[{name:"Normal",data:t},{name:"Reply",data:s},{name:"Renote",data:i}],xaxis:{type:"datetime",crosshairs:{width:1,opacity:1}}}).render()}))}});const v=(0,n.Z)(h,(function(){var e=this._self._c;this._self._setupProxy;return e("div",[e("div",{ref:"chart"})])}),[],!1,null,null,null).exports;var g=s(94307);const x=i.ZP.extend({i18n:(0,a.Z)(),components:{XTimeline:d,XPhotos:p,XActivity:v,XReactions:g.Z},props:{user:{type:Object,required:!0}},data(){return{makeFrequentlyRepliedUsersPromise:()=>this.$root.api("users/get-frequently-replied-users",{userId:this.user.id},!1,!this.$store.getters.isSignedIn).then((e=>e.map((e=>e.user))))}},methods:{}});s(6551);const y=(0,n.Z)(x,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"lnctpgve"},[e._l(e.user.pinnedNotes,(function(e){return t("mk-note-detail",{key:e.id,attrs:{note:e,compact:!0}})})),t("div",{staticClass:"activity"},[t("ui-container",{attrs:{"body-togglable":!0,expanded:e.$store.state.device.expandUsersActivity},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersActivity",value:t})},scopedSlots:e._u([{key:"header",fn:function(){return[t("fa",{attrs:{icon:"chart-bar"}}),e._v("Activity")]},proxy:!0}])},[t("x-activity",{staticStyle:{padding:"16px"},attrs:{user:e.user,limit:35}})],1)],1),t("x-reactions",{attrs:{user:e.user}}),t("mk-user-list",{attrs:{"make-promise":e.makeFrequentlyRepliedUsersPromise,expanded:e.$store.state.device.expandUsersFrequentlyRepliedUsers,"icon-only":!0},on:{toggle:t=>e.$store.commit("device/set",{key:"expandUsersFrequentlyRepliedUsers",value:t})}},[t("fa",{attrs:{icon:"users"}}),e._v(" "+e._s(e.$t("@.frequently-replied-users")))],1),t("x-photos",{attrs:{user:e.user}}),t("x-timeline",{ref:"tl",attrs:{user:e.user}})],2)}),[],!1,null,"34019277",null).exports},10908:(e,t,s)=>{var i=s(62293);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);(0,s(80950).Z)("763bd37e",i,!0,{})},6551:(e,t,s)=>{var i=s(1243);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);(0,s(80950).Z)("ab245a58",i,!0,{})},75872:(e,t,s)=>{var i=s(89361);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);(0,s(80950).Z)("2b8363aa",i,!0,{})},62739:(e,t,s)=>{var i=s(48462);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);(0,s(80950).Z)("fdfc59f0",i,!0,{})}}]);