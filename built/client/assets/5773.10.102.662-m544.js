(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[5773],{43446:(t,s,e)=>{var r=e(11063),o=e(26143)(r);o.push([t.id,".mkw-rss .mkw-rss--body .feed[data-v-e2c9e888]{font-size:.9em;padding:12px 16px}.mkw-rss .mkw-rss--body .feed>a[data-v-e2c9e888]{color:var(--text);display:block;overflow:hidden;padding:4px 0;text-overflow:ellipsis;white-space:nowrap}.mkw-rss .mkw-rss--body .feed>a[data-v-e2c9e888]:last-child{border-bottom:none}.mkw-rss .mkw-rss--body .fetching[data-v-e2c9e888]{color:var(--text);margin:0;padding:16px;text-align:center}.mkw-rss .mkw-rss--body .fetching>[data-icon][data-v-e2c9e888]{margin-right:4px}.mkw-rss .mkw-rss--body[data-mobile][data-v-e2c9e888]{background:var(--face)}.mkw-rss .mkw-rss--body[data-mobile] .feed[data-v-e2c9e888]{padding:0}.mkw-rss .mkw-rss--body[data-mobile] .feed>a[data-v-e2c9e888]{border-bottom:none;padding:8px 16px}.mkw-rss .mkw-rss--body[data-mobile] .feed>a[data-v-e2c9e888]:nth-child(2n){background:rgba(0,0,0,.05)}",""]),t.exports=o},7711:(t,s,e)=>{"use strict";e.d(s,{Z:()=>o});var r=e(31508);function o(t){return r.ZP.extend({props:{widget:{type:Object},column:{type:Object,default:null},platform:{type:String,required:!0},isCustomizeMode:{type:Boolean,default:!1}},computed:{id(){return this.widget.id},props(){return this.widget.data}},data:()=>({bakedOldProps:null}),created(){this.mergeProps(),this.$watch("props",(()=>{this.mergeProps()})),this.bakeProps()},methods:{bakeProps(){this.bakedOldProps=JSON.stringify(this.props)},mergeProps(){if(t.props){const s=t.props();for(const t of Object.keys(s))this.props.hasOwnProperty(t)||r.ZP.set(this.props,t,s[t])}},save(){this.bakedOldProps!=JSON.stringify(this.props)&&(this.bakeProps(),"deck"==this.platform?this.$store.commit("device/updateDeckColumn",this.column):this.$root.api("i/update_widget",{id:this.id,data:this.props}))}}})}},55773:(t,s,e)=>{"use strict";e.r(s),e.d(s,{default:()=>i});var r=e(7711),o=e(46813);const a=(0,r.Z)({name:"rss",props:()=>({compact:!1,url:"https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss"})}).extend({i18n:(0,o.Z)(),data:()=>({items:[],fetching:!0,clock:null}),mounted(){this.fetch(),this.clock=setInterval(this.fetch,6e4)},beforeDestroy(){clearInterval(this.clock)},methods:{func(){this.props.compact=!this.props.compact,this.save()},fetch(){fetch(`https://api.rss2json.com/v1/api.json?rss_url=${this.props.url}`,{}).then((t=>{t.json().then((t=>{this.items=t.items,this.fetching=!1}))}))},setting(){this.$root.dialog({title:"URL",input:{type:"url",default:this.props.url}}).then((({canceled:t,result:s})=>{t||(this.props.url=s,this.save(),this.fetch())}))}}});e(56230);const i=(0,e(26385).Z)(a,(function(){var t=this,s=t._self._c;t._self._setupProxy;return s("div",{staticClass:"mkw-rss"},[s("ui-container",{attrs:{"show-header":!t.props.compact},scopedSlots:t._u([{key:"header",fn:function(){return[s("fa",{attrs:{icon:"rss-square"}}),t._v("RSS")]},proxy:!0},{key:"func",fn:function(){return[s("button",{attrs:{title:"設定"},on:{click:t.setting}},[s("fa",{attrs:{icon:"cog"}})],1)]},proxy:!0}])},[s("div",{staticClass:"mkw-rss--body",attrs:{"data-mobile":"mobile"==t.platform}},[t.fetching?s("p",{staticClass:"fetching"},[s("fa",{attrs:{icon:"spinner",pulse:"","fixed-width":""}}),t._v(t._s(t.$t("@.loading"))),s("mk-ellipsis")],1):s("div",{staticClass:"feed"},t._l(t.items,(function(e){return s("a",{attrs:{href:e.link,rel:"nofollow noopener",target:"_blank",title:e.title}},[t._v(t._s(e.title))])})),0)])])],1)}),[],!1,null,"e2c9e888",null).exports},56230:(t,s,e)=>{var r=e(43446);r.__esModule&&(r=r.default),"string"==typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals);(0,e(80950).Z)("abd523b8",r,!0,{})}}]);