(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[9308],{15813:(t,s,e)=>{var i=e(11063),o=e(26143)(i);o.push([t.id,'.qpdmibaztplkylerhdbllwcokyrfxeyj.dual>svg[data-v-73a6fdb9]{float:left;width:50%}.qpdmibaztplkylerhdbllwcokyrfxeyj.dual>svg[data-v-73a6fdb9]:first-child{padding-right:5px}.qpdmibaztplkylerhdbllwcokyrfxeyj.dual>svg[data-v-73a6fdb9]:last-child{padding-left:5px}.qpdmibaztplkylerhdbllwcokyrfxeyj>svg[data-v-73a6fdb9]{display:block;padding:10px;width:100%}.qpdmibaztplkylerhdbllwcokyrfxeyj>svg>text[data-v-73a6fdb9]{fill:var(--chartCaption);font-size:5px}.qpdmibaztplkylerhdbllwcokyrfxeyj>svg>text>tspan[data-v-73a6fdb9]{opacity:.5}.qpdmibaztplkylerhdbllwcokyrfxeyj[data-v-73a6fdb9]:after{clear:both;content:"";display:block}',""]),t.exports=o},7711:(t,s,e)=>{"use strict";e.d(s,{Z:()=>o});var i=e(31508);function o(t){return i.ZP.extend({props:{widget:{type:Object},column:{type:Object,default:null},platform:{type:String,required:!0},isCustomizeMode:{type:Boolean,default:!1}},computed:{id(){return this.widget.id},props(){return this.widget.data}},data:()=>({bakedOldProps:null}),created(){this.mergeProps(),this.$watch("props",(()=>{this.mergeProps()})),this.bakeProps()},methods:{bakeProps(){this.bakedOldProps=JSON.stringify(this.props)},mergeProps(){if(t.props){const s=t.props();for(const t of Object.keys(s))this.props.hasOwnProperty(t)||i.ZP.set(this.props,t,s[t])}},save(){this.bakedOldProps!=JSON.stringify(this.props)&&(this.bakeProps(),"deck"==this.platform?this.$store.commit("device/updateDeckColumn",this.column):this.$root.api("i/update_widget",{id:this.id,data:this.props}))}}})}},14934:(t,s,e)=>{"use strict";e.r(s),e.d(s,{default:()=>r});var i=e(7711),o=e(46813),l=e(37705);const a=(0,i.Z)({name:"posts-monitor",props:()=>({design:0,view:0})}).extend({i18n:(0,o.Z)("common/views/widgets/posts-monitor.vue"),data:()=>({connection:null,viewBoxY:30,stats:[],fediGradientId:(0,l.Z)(),fediMaskId:(0,l.Z)(),localGradientId:(0,l.Z)(),localMaskId:(0,l.Z)(),fediPolylinePoints:"",localPolylinePoints:"",fediPolygonPoints:"",localPolygonPoints:"",fediHeadX:null,fediHeadY:null,localHeadX:null,localHeadY:null}),computed:{viewBoxX(){return 0==this.props.view?50:100}},watch:{viewBoxX(){this.draw()}},mounted(){this.connection=this.$root.stream.useSharedConnection("notesStats"),this.connection.on("stats",this.onStats),this.connection.on("statsLog",this.onStatsLog),this.connection.send("requestLog",{id:Math.random().toString().substr(2,8)})},beforeDestroy(){this.connection.dispose()},methods:{toggle(){2==this.props.view?this.props.view=0:this.props.view++,this.save()},func(){2==this.props.design?this.props.design=0:this.props.design++,this.save()},draw(){const t=0==this.props.view?this.stats.slice(-50):this.stats,s=Math.max.apply(null,t.map((t=>t.all)))||1,e=Math.max.apply(null,t.map((t=>t.local)))||1,i=t.map(((e,i)=>[this.viewBoxX-(t.length-1-i),(1-e.all/s)*this.viewBoxY])),o=t.map(((s,i)=>[this.viewBoxX-(t.length-1-i),(1-s.local/e)*this.viewBoxY]));this.fediPolylinePoints=i.map((t=>`${t[0]},${t[1]}`)).join(" "),this.localPolylinePoints=o.map((t=>`${t[0]},${t[1]}`)).join(" "),this.fediPolygonPoints=`${this.viewBoxX-(t.length-1)},${this.viewBoxY} ${this.fediPolylinePoints} ${this.viewBoxX},${this.viewBoxY}`,this.localPolygonPoints=`${this.viewBoxX-(t.length-1)},${this.viewBoxY} ${this.localPolylinePoints} ${this.viewBoxX},${this.viewBoxY}`,this.fediHeadX=i[i.length-1][0],this.fediHeadY=i[i.length-1][1],this.localHeadX=o[o.length-1][0],this.localHeadY=o[o.length-1][1]},onStats(t){this.stats.push(t),this.stats.length>100&&this.stats.shift(),this.draw()},onStatsLog(t){for(const s of t)this.onStats(s)}}});e(31440);const r=(0,e(26385).Z)(a,(function(){var t=this,s=t._self._c;t._self._setupProxy;return s("div",{staticClass:"mkw-posts-monitor"},[s("ui-container",{attrs:{"show-header":0==t.props.design,naked:2==t.props.design},scopedSlots:t._u([{key:"header",fn:function(){return[s("fa",{attrs:{icon:"chart-line"}}),t._v(t._s(t.$t("title")))]},proxy:!0},{key:"func",fn:function(){return[s("button",{attrs:{title:t.$t("toggle")},on:{click:t.toggle}},[s("fa",{attrs:{icon:"sort"}})],1)]},proxy:!0}])},[s("div",{staticClass:"qpdmibaztplkylerhdbllwcokyrfxeyj",class:{dual:0==t.props.view}},[s("svg",{directives:[{name:"show",rawName:"v-show",value:2!=t.props.view,expression:"props.view != 2"}],attrs:{viewBox:`0 0 ${t.viewBoxX} ${t.viewBoxY}`}},[s("defs",[s("linearGradient",{attrs:{id:t.localGradientId,x1:"0",x2:"0",y1:"1",y2:"0"}},[s("stop",{attrs:{offset:"0%","stop-color":"hsl(200, 80%, 70%)"}}),s("stop",{attrs:{offset:"100%","stop-color":"hsl(90, 80%, 70%)"}})],1),s("mask",{attrs:{id:t.localMaskId,x:"0",y:"0",width:t.viewBoxX,height:t.viewBoxY}},[s("polygon",{attrs:{points:t.localPolygonPoints,fill:"#fff","fill-opacity":"0.5"}}),s("polyline",{attrs:{points:t.localPolylinePoints,fill:"none",stroke:"#fff","stroke-width":"1"}}),s("circle",{attrs:{cx:t.localHeadX,cy:t.localHeadY,r:"1.5",fill:"#fff"}})])],1),s("rect",{style:`stroke: none; fill: url(#${t.localGradientId}); mask: url(#${t.localMaskId})`,attrs:{x:"-2",y:"-2",width:t.viewBoxX+4,height:t.viewBoxY+4}}),s("text",{attrs:{x:"1",y:"5"}},[t._v("Local")])]),s("svg",{directives:[{name:"show",rawName:"v-show",value:1!=t.props.view,expression:"props.view != 1"}],attrs:{viewBox:`0 0 ${t.viewBoxX} ${t.viewBoxY}`}},[s("defs",[s("linearGradient",{attrs:{id:t.fediGradientId,x1:"0",x2:"0",y1:"1",y2:"0"}},[s("stop",{attrs:{offset:"0%","stop-color":"hsl(200, 80%, 70%)"}}),s("stop",{attrs:{offset:"100%","stop-color":"hsl(90, 80%, 70%)"}})],1),s("mask",{attrs:{id:t.fediMaskId,x:"0",y:"0",width:t.viewBoxX,height:t.viewBoxY}},[s("polygon",{attrs:{points:t.fediPolygonPoints,fill:"#fff","fill-opacity":"0.5"}}),s("polyline",{attrs:{points:t.fediPolylinePoints,fill:"none",stroke:"#fff","stroke-width":"1"}}),s("circle",{attrs:{cx:t.fediHeadX,cy:t.fediHeadY,r:"1.5",fill:"#fff"}})])],1),s("rect",{style:`stroke: none; fill: url(#${t.fediGradientId}); mask: url(#${t.fediMaskId})`,attrs:{x:"-2",y:"-2",width:t.viewBoxX+4,height:t.viewBoxY+4}}),s("text",{attrs:{x:"1",y:"5"}},[t._v("Fedi")])])])])],1)}),[],!1,null,"73a6fdb9",null).exports},31440:(t,s,e)=>{var i=e(15813);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);(0,e(80950).Z)("3e1dbea0",i,!0,{})}}]);