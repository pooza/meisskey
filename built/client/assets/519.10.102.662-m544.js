(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[519],{70679:(t,s,e)=>{var i=e(11063),o=e(26143)(i);o.push([t.id,".CpgJxwDNgyzC8Ypztid4{padding:8px}",""]),o.locals={body:"CpgJxwDNgyzC8Ypztid4"},t.exports=o},7711:(t,s,e)=>{"use strict";e.d(s,{Z:()=>o});var i=e(31508);function o(t){return i.ZP.extend({props:{widget:{type:Object},column:{type:Object,default:null},platform:{type:String,required:!0},isCustomizeMode:{type:Boolean,default:!1}},computed:{id(){return this.widget.id},props(){return this.widget.data}},data:()=>({bakedOldProps:null}),created(){this.mergeProps(),this.$watch("props",(()=>{this.mergeProps()})),this.bakeProps()},methods:{bakeProps(){this.bakedOldProps=JSON.stringify(this.props)},mergeProps(){if(t.props){const s=t.props();for(const t of Object.keys(s))this.props.hasOwnProperty(t)||i.ZP.set(this.props,t,s[t])}},save(){this.bakedOldProps!=JSON.stringify(this.props)&&(this.bakeProps(),"deck"==this.platform?this.$store.commit("device/updateDeckColumn",this.column):this.$root.api("i/update_widget",{id:this.id,data:this.props}))}}})}},8492:(t,s,e)=>{"use strict";e.r(s),e.d(s,{default:()=>d});var i=e(7711),o=e(46813);const r=(0,i.Z)({name:"activity",props:()=>({compact:!1})}).extend({i18n:(0,o.Z)(),components:{XActivity:()=>Promise.all([e.e(6800),e.e(7299)]).then(e.bind(e,87299)).then((t=>t.default))},methods:{func(){this.props.compact=!this.props.compact,this.save()}}});var p=e(11282),a=e.n(p);const d=(0,e(26385).Z)(r,(function(){var t=this,s=t._self._c;t._self._setupProxy;return s("div",{staticClass:"mkw-activity"},[s("ui-container",{attrs:{"show-header":!t.props.compact},scopedSlots:t._u([{key:"header",fn:function(){return[s("fa",{attrs:{icon:"chart-bar"}}),t._v(t._s(t.$t("activity")))]},proxy:!0}])},[s("div",{class:t.$style.body},[s("x-activity",{attrs:{user:t.$store.state.i}})],1)])],1)}),[],!1,(function(t){this.$style=a().locals||a()}),null,null).exports},11282:(t,s,e)=>{var i=e(70679);i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);(0,e(80950).Z)("1004afd4",i,!0,{})}}]);