<template>
  <div class="suspend" v-if="$route.path.indexOf('/detail/') == -1 && $route.path.indexOf('/community-detail/') == -1">
    <div id="backTop" class="back-top" @click="backTop()"></div>
    <div class="button-box" @click="popUp()">
      <div class="button">
        <img src="@/assets/images/post/icon-post.png"/>
      </div>
    </div>
    <div class="elastic-layer suspend-elastic-layer" v-if="showLayer" @click.self="showLayer=false">
      <div class="edit-button close" @click="showLayer=false"></div>
      <div class="elastic-layer-content">
        <Post :location="'suspend'" @postSuccess="postSuccess()"/>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { reactive,toRefs } from "vue";
  import { useStore } from 'vuex';
  import { useRouter } from "vue-router";
  import LoginMask from "@/component/login-mask.vue";
  import Post from '@/component/post.vue';
  export default {
    components: {
      Post,
      LoginMask
    },
    props:{},
    setup(props,{emit}){
      const store = useStore();
      const router = useRouter();

      //state
      const state = reactive({
        showLogin:false,
        showLayer:false
      })

      //backTop
      const backTop = () => {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      }
      //pop up
      const popUp = () => {
        if(!store.getters.isLogin){
          state.showLogin = true;
        }else{
          state.showLayer = true;
          document.getElementsByTagName('body')[0].classList.add("fixed");
        }
      }
      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      //postSuccess
      const postSuccess = () => {
        state.showLayer=false;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("postSuccess");
      }

      return {
        ...toRefs(state),
        backTop,
        popUp,
        showLoginMask,
        closeLoginMask,
        postSuccess,
      }
    },
    
  };
</script>

<style lang="scss">
  
</style>
