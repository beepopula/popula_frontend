<template>
  <div class="elastic-layer edit-layer" @click.self="closeEditLayer()">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box">
      <div class="edit-head">
        Edit News
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">Save</div>
        </div>
      </div>
      <div class="edit-form">
        <div class="mian-form">
          

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  export default {
    components: {
    },
    props:{
      editInfo:{
        type:Array,
        value:[]
      },
      communityId:{
        type:String,
        value:""
      }
    },
    setup(props,{emit}) {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const state = reactive({
        news:props.editInfo,
        //other
        
      })

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      //edit
      const save = async () => {
        proxy.$Loading.showLoading({title: "Loading"});
        const param = {
          accountId:'bhc8521.testnet', //store.getters.accountId,
          communityId:props.communityId,
          ...state.edit,
        }
        try{
          const res = await proxy.$axios.community.set_community_contributor(param);
          if(res.success){
            emit('updateInfo',state.edit);
          }else{
            throw new Error("request failed")
          }
        }catch(e){
          console.log("set_community_contributor:"+e);
          proxy.$Message({
            message: "Edit Failed",
            type: "error",
          });
        }
        proxy.$Loading.hideLoading();
        
      }

      return {
        ...toRefs(state),
        save,
        closeEditLayer,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .edit-layer{
    background: rgba(0,0,0,0.56);
    .edit-box{
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width: 690px;
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      .edit-head{
        display:flex;
        align-items: center;
        justify-content:space-between;
        height:76px;
        padding:0 20px;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        background: #36363C;
        .mini-button-border{
          padding: 2px;
          width: 90px;
          height: 40px;
          border-radius: 24px;
          background:  rgba(255,255,255,0.2);
          cursor:pointer;
          position:relative;
          &::after {
            content: "";
            position: absolute;
            top: 0;
            left:0;
            width: 100%;
            height: 100%;
            transform-origin:center;
            transform:scale(1.1);
            filter: blur(10px) brightness(80%) opacity(.8);
            border-radius: 24px;
            background:  #FED23C;
            z-index: 1;
            transition:opacity 0.7s;
            opacity:0;
          }
          &:hover{
            background:  #FED23C;
            &::after {
              opacity:0.8;
            }
          }
          .mini-button{
            width: 86px;
            height: 36px;
            border-radius: 20px;
            background: #28282D;
            display:flex;
            align-items: center;
            justify-content: center;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
            position:relative;
            z-index:2;
          }
        }
      }
      .edit-form{
        position:relative;
        .mian-form{
          padding:0 20px 20px;
          max-height: calc(100vh - 196px);
          overflow-y: scroll;

        }
      }
    }
  }
</style>