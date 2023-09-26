"use strict";(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[9706],{19706:(e,t,o)=>{o.r(t),o.d(t,{default:()=>d});var i=o(31508),r=o(46813),n=o(87186),s=o(62357),l=o(3123),a=o(32971);const f=i.ZP.extend({i18n:(0,r.Z)("mobile/views/pages/drive.vue"),components:{XDrive:()=>o.e(7588).then(o.bind(o,27588)).then((e=>e.default))},data:()=>({Progress:n.Z,folder:null,file:null,initFolder:null,initFile:null}),created(){this.initFolder=this.$route.params.folder,this.initFile=this.$route.params.file,window.addEventListener("popstate",this.onPopState)},mounted(){document.title=`${this.$root.instanceName} Drive`},beforeDestroy(){window.removeEventListener("popstate",this.onPopState)},methods:{onPopState(){this.$route.params.folder?this.$refs.browser.cd(this.$route.params.folder,!0):this.$route.params.file?this.$refs.browser.cf(this.$route.params.file,!0):this.$refs.browser.goRoot(!0)},onMoveRoot(e){const t=`${this.$root.instanceName} Drive`;e||history.pushState(null,t,"/i/drive"),document.title=t,this.file=null,this.folder=null},onOpenFolder(e,t){const o=`${e.name} | ${this.$root.instanceName} Drive`;t||history.pushState(null,o,`/i/drive/folder/${e.id}`),document.title=o,this.file=null,this.folder=e},onOpenFile(e,t){const o=`${e.name} | ${this.$root.instanceName} Drive`;t||history.pushState(null,o,`/i/drive/file/${e.id}`),document.title=o,this.file=e,this.folder=null},openContextMenu(){this.$root.new(s.Z,{items:[{type:"item",text:this.$t("contextmenu.upload"),icon:"upload",action:this.$refs.browser.selectLocalFile},{type:"item",text:this.$t("contextmenu.url-upload"),icon:a.r6c,action:this.$refs.browser.urlUpload},{type:"item",text:this.$t("contextmenu.create-folder"),icon:["far","folder"],action:this.$refs.browser.createFolder},...this.folder?[{type:"item",text:this.$t("contextmenu.rename-folder"),icon:"i-cursor",action:this.$refs.browser.renameFolder},{type:"item",text:this.$t("contextmenu.move-folder"),icon:["far","folder-open"],action:this.$refs.browser.moveFolder},{type:"item",text:this.$t("contextmenu.delete-folder"),icon:l.I7,action:this.$refs.browser.deleteFolder}]:[]],source:this.$refs.contextSource})}}});const d=(0,o(26385).Z)(f,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("mk-ui",{scopedSlots:e._u([{key:"header",fn:function(){return[e.folder?[t("span",{staticStyle:{"margin-right":"4px"}},[t("fa",{attrs:{icon:["far","folder-open"]}})],1),e._v(e._s(e.folder.name))]:e._e(),e.file?[t("mk-file-type-icon",{staticStyle:{"margin-right":"4px"},attrs:{"data-icon":"",type:e.file.type}}),e._v(e._s(e.file.name))]:e._e(),e.folder||e.file?e._e():[t("span",{staticStyle:{"margin-right":"4px"}},[t("fa",{attrs:{icon:"cloud"}})],1),e._v(e._s(e.$t("@.drive")))]]},proxy:!0},e.folder||!e.folder&&!e.file?{key:"func",fn:function(){return[t("button",{ref:"contextSource",on:{click:e.openContextMenu}},[t("fa",{attrs:{icon:"ellipsis-h"}})],1)]},proxy:!0}:null],null,!0)},[t("x-drive",{ref:"browser",attrs:{"init-folder":e.initFolder,"init-file":e.initFile,"is-naked":!0,top:e.$store.state.uiHeaderHeight},on:{"begin-fetch":function(t){return e.Progress.start()},"fetched-mid":function(t){return e.Progress.set(.5)},fetched:function(t){return e.Progress.done()},"move-root":e.onMoveRoot,"open-folder":e.onOpenFolder,"open-file":e.onOpenFile}})],1)}),[],!1,null,null,null).exports}}]);