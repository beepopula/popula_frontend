<template>

    <!-- follow -->
    <div class="mini-button-border follow following" v-if="isFollowed">
      <div class="mini-button" :style="'background:'+background" @click.stop="changeFollow()">
        <template v-if="isFollowing">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </template>
        <template v-else>
          <span class="static-text">Following</span>
          <span class="hover-text">Unfollow</span>
        </template>
      </div>
    </div>
    <div class="mini-button-border follow" v-else>
      <div class="mini-button" :style="'background:'+background" @click.stop="changeFollow()">
        <template v-if="isFollowing">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </template>
        <template v-else>
          Follow
        </template>
      </div>
    </div>

    <!-- follow notice -->
    <div :class="['pop-box','pop-intro','pop-notice',$props.position]" v-if="showNotice">
      <div class="title">Notice</div>
      <div class="intro">This action will be recorded as a transaction on Near Protocol, details can be verify on <a href="https://wallet.testnet.near.org/" target="_blank">Recent activity</a></div>
      <div class="button-box">
        <div class="mini-button-border button-cancel" @click.stop="showNotice=false">
          <div class="mini-button">Cancel</div>
        </div>
        <div class="mini-button-border" @click.stop="confirmFollow()">
          <div class="mini-button">Confirm</div>
        </div>
      </div>
   
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { reactive, toRefs, watch  } from "vue";
  import { useStore } from 'vuex';
  import MainContract from "@/contract/MainContract";
  import LoginMask from "@/component/login-mask.vue";
  export default {
    components: {
      LoginMask
    },
    props:{
      isFollow:{
        type:Boolean,
        value:false
      },
      accountId:{
        type:String,
        value:""
      },
      background:{
        type:String,
        value:"#000"
      },
      from:{
        type:String,
        value:""
      },
      position:{
        type:String,
        value:""
      }
    },
    setup(props,{ emit }) {
      const store = useStore();
      const mainContract = new MainContract(store.state.account);

      //state
      const state = reactive({
        isFollowed:props.isFollow,
        isFollowing:false,
        showLogin:false,
        showNotice:false,
      })

      const init = () => {
        
      }

      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      const confirmFollow = () => {
        state.showNotice = false;
        localStorage.setItem("followAlerted",true);
        changeFollow();
      }

      const changeFollow = async () => {
        if(store.getters.isLogin){
          if(state.isFollowing) {
            return
          }
          //notice
          if(!localStorage.getItem("followAlerted")){
            state.showNotice = true;
            return;
          }
          state.isFollowing = true;
          try{
            const res = state.isFollowed ? await mainContract.unfollow({account_id:props.accountId}) : await mainContract.follow({account_id:props.accountId})
            if (res == true) {
              state.isFollowed  = !state.isFollowed;
              state.isFollowing = false;
              emit('follow',{
                isFollow:state.isFollowed,
                accountId:props.accountId
              });
            } else  if (res == false) {
              throw new Error('error')
            } else {}
          }catch(e){
            state.isFollowing = false;
            const message = state.isFollowed ? 'Unfollow Failed' : 'Follow Failed';
            proxy.$Message({
              message,
              type: "error",
            });
            console.log("follow error:"+e);
            return;
          }
        }else{
          if(props.from=='popup'){
            emit("login");
          }else{
            state.showLogin = true
          }
        }
      }

      return {
        ...toRefs(state),
        showLoginMask,
        closeLoginMask,
        changeFollow,
        confirmFollow
      };
    },
    mounted(){
      
    }
  }
</script>

<style lang="scss">
  .pop-notice{
    position:absolute;
    top:46px;
    right:0;
    .title{
      text-align: left;
    }
    &.right{
      left:auto;
      right:0;
    }
  }

</style>
