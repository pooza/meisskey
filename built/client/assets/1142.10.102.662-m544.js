(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[1142],{247:(e,t,a)=>{var s=a(11063),o=a(26143)(s);o.push([e.id,'.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-compact]>.banner[data-v-186cbd5d]:before{background:rgba(0,0,0,.5);content:"";display:block;height:100%;width:100%}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-compact]>.avatar[data-v-186cbd5d]{border:none;border-radius:100%;box-shadow:0 0 16px rgba(0,0,0,.5);left:21px;top:21px}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-compact]>.name[data-v-186cbd5d]{color:#fff;left:92px;line-height:100px;margin:0;position:absolute;text-shadow:0 0 8px rgba(0,0,0,.5);top:0}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-compact]>.username[data-v-186cbd5d]{display:none}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-melt]>.banner[data-v-186cbd5d]{visibility:hidden}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-melt]>.avatar[data-v-186cbd5d]{box-shadow:none}.egwyvoaaryotefqhqtmiyawwefemjfsd-body[data-melt]>.name[data-v-186cbd5d]{color:#666;text-shadow:none}.egwyvoaaryotefqhqtmiyawwefemjfsd-body>.banner[data-v-186cbd5d]{background-color:var(--primaryAlpha01);background-position:50%;background-size:cover;cursor:pointer;height:100px}.egwyvoaaryotefqhqtmiyawwefemjfsd-body>.avatar[data-v-186cbd5d]{border:3px solid var(--face);border-radius:8px;cursor:pointer;display:block;height:58px;left:16px;position:absolute;top:76px;width:58px}.egwyvoaaryotefqhqtmiyawwefemjfsd-body>.name[data-v-186cbd5d]{color:var(--text);display:block;font-weight:700;line-height:16px;margin:10px 0 0 84px}.egwyvoaaryotefqhqtmiyawwefemjfsd-body>.username[data-v-186cbd5d]{color:var(--text);display:block;font-size:.9em;line-height:16px;margin:4px 0 8px 84px;opacity:.7}',""]),e.exports=o},7711:(e,t,a)=>{"use strict";a.d(t,{Z:()=>o});var s=a(31508);function o(e){return s.ZP.extend({props:{widget:{type:Object},column:{type:Object,default:null},platform:{type:String,required:!0},isCustomizeMode:{type:Boolean,default:!1}},computed:{id(){return this.widget.id},props(){return this.widget.data}},data:()=>({bakedOldProps:null}),created(){this.mergeProps(),this.$watch("props",(()=>{this.mergeProps()})),this.bakeProps()},methods:{bakeProps(){this.bakedOldProps=JSON.stringify(this.props)},mergeProps(){if(e.props){const t=e.props();for(const e of Object.keys(t))this.props.hasOwnProperty(e)||s.ZP.set(this.props,e,t[e])}},save(){this.bakedOldProps!=JSON.stringify(this.props)&&(this.bakeProps(),"deck"==this.platform?this.$store.commit("device/updateDeckColumn",this.column):this.$root.api("i/update_widget",{id:this.id,data:this.props}))}}})}},91142:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>d});var s=a(7711),o=a(46813);const r=(0,s.Z)({name:"profile",props:()=>({design:0})}).extend({i18n:(0,o.Z)("desktop/views/widgets/profile.vue"),methods:{func(){2==this.props.design?this.props.design=0:this.props.design++,this.save()}}});a(45969);const d=(0,a(26385).Z)(r,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("div",{staticClass:"egwyvoaaryotefqhqtmiyawwefemjfsd"},[t("ui-container",{attrs:{"show-header":!1,naked:2==e.props.design}},[t("div",{staticClass:"egwyvoaaryotefqhqtmiyawwefemjfsd-body",attrs:{"data-compact":1==e.props.design||2==e.props.design,"data-melt":2==e.props.design}},[t("div",{staticClass:"banner",style:e.$store.state.i.bannerUrl?`background-image: url(${e.$store.state.i.bannerUrl})`:""}),t("mk-avatar",{staticClass:"avatar",attrs:{user:e.$store.state.i,"disable-preview":!0}}),t("router-link",{staticClass:"name",attrs:{to:e._f("userPage")(e.$store.state.i)}},[t("mk-user-name",{attrs:{user:e.$store.state.i}})],1),t("p",{staticClass:"username"},[e._v("@"+e._s(e._f("acct")(e.$store.state.i)))])],1)])],1)}),[],!1,null,"186cbd5d",null).exports},45969:(e,t,a)=>{var s=a(247);s.__esModule&&(s=s.default),"string"==typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals);(0,a(80950).Z)("3d0fb9b4",s,!0,{})}}]);