"use strict";(self.webpackChunkmisskey=self.webpackChunkmisskey||[]).push([[743],{7711:(s,e,t)=>{t.d(e,{Z:()=>p});var i=t(31508);function p(s){return i.ZP.extend({props:{widget:{type:Object},column:{type:Object,default:null},platform:{type:String,required:!0},isCustomizeMode:{type:Boolean,default:!1}},computed:{id(){return this.widget.id},props(){return this.widget.data}},data:()=>({bakedOldProps:null}),created(){this.mergeProps(),this.$watch("props",(()=>{this.mergeProps()})),this.bakeProps()},methods:{bakeProps(){this.bakedOldProps=JSON.stringify(this.props)},mergeProps(){if(s.props){const e=s.props();for(const s of Object.keys(e))this.props.hasOwnProperty(s)||i.ZP.set(this.props,s,e[s])}},save(){this.bakedOldProps!=JSON.stringify(this.props)&&(this.bakeProps(),"deck"==this.platform?this.$store.commit("device/updateDeckColumn",this.column):this.$root.api("i/update_widget",{id:this.id,data:this.props}))}}})}},20743:(s,e,t)=>{t.r(e),t.d(e,{default:()=>p});const i=(0,t(7711).Z)({name:"activity",props:()=>({design:0,view:0})}).extend({methods:{func(){2==this.props.design?this.props.design=0:this.props.design++,this.save()},viewChanged(s){this.props.view=s,this.save()}}});const p=(0,t(26385).Z)(i,(function(){var s=this,e=s._self._c;s._self._setupProxy;return e("mk-activity",{attrs:{design:s.props.design,"init-view":s.props.view,user:s.$store.state.i},on:{"view-changed":s.viewChanged}})}),[],!1,null,null,null).exports}}]);