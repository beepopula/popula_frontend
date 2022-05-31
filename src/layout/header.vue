<template>
  <div class="page-header-box">
    <div class="page-header">
      <div class="left-mode">
        <div class="logo" @click="redirectPage('/')">
          <img src="@/assets/images/header/logo.png">
        </div>
        <el-input class="search-box" v-model="searchWord" @change="search()"/>
      </div>

      <div class="right-nav" align="middle">
        <div :class="['right-nav-item','nav-hover',$route.path.indexOf('/communities')>-1 ? 'action' : '']" @click="redirectPage('/communities')"><span>Communities</span></div>
        <div :class="['right-nav-item','nav-hover',$route.path == '/explore' ? 'action' : '']" @click="redirectPage('/explore')"><span>Explore</span></div>
        <div v-if="false" :class="['right-nav-item','nav-hover',$route.path.indexOf('/create')>-1 ? 'action' : '']" @click="redirectPage('/create-list')"><span>Tools</span></div>
        <a v-if="false" class="right-nav-item nav-hover" target="_blank" href="https://www.notion.so/bepopula/FAQs-81506fb8e8ab4a68b837aee0decfb888"><span>Learn</span></a>
        <div v-if="!store.getters.isLogin" class="user-login mini-button-border">
          <div class="mini-button" @click="showLoginMask">Sign in</div>
        </div>
        <div v-else class="right-nav-item user-photo">
          <el-popover
            popper-class="user-menu-box"
            placement="bottom-end"
            :width="200"
            trigger="hover"
            >
            <template #reference>
              <img v-if="store.state.profile.avatar" class="user-photo-img" :src="store.state.profile.avatar"/>
              <img v-else class="user-photo-img" src="@/assets/images/common/user-default.png"/>
            </template>
            <div class="user-menu-list">
              <div class="user-menu-item account" @click="triggerCopy">
                <div>{{ store.getters.accountId }}</div>
              </div>
              <!--
              <div class="user-menu-item" @click="redirectPage('/wallet')">My token</div>
              -->
              <div class="user-menu-item" @click="redirectPage('/mine')">Profile</div>
              <div class="user-menu-item" @click="logout">Sign Out</div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
  </div>
  <!-- #copy_text  display:none;  -->
  <div :data-clipboard-text="store.getters.accountId" ref="copy_text"  id="copy_text" @click="handleCopyFun"></div>
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import Clipboard from 'clipboard';
import { ref,reactive, getCurrentInstance, toRefs , watch } from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import LoginMask from "@/component/login-mask.vue";
export default {
  components: {
    LoginMask
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();

    const state = reactive({
      oldSearchWord:"",
      searchWord:"",
      showLogin:false,
    })

    watch(
			() => route.path,
			() => {
        if(route.path.indexOf('/search') == -1){
          state.searchWord = ""
          state.oldSearchWord = ""
          store.commit("setSearchWord", state.searchWord);
        }
			}
		);

    const search = () => {
      if(state.oldSearchWord == state.searchWord || !state.searchWord ){return}
      state.oldSearchWord = state.searchWord
      store.commit("setSearchWord", state.searchWord);
      router.push("/search");
    }

    const switchModel = () => {
      store.commit("setTheme", store.state.theme === "black" ? "light" : "black");
    };

    const showLoginMask = () => {
      state.showLogin = true
    }

    const closeLoginMask = () => {
      state.showLogin = false
    }

    const login = async () => {
      await store.dispatch("test", "sender")
    }

    const logout = async () => {
      await store.dispatch("logout");

    }

    const redirectPage = (path) => {
      router.push(path);
    };

    const copy_text = ref()
    const triggerCopy = () => {
      copy_text.value.click()
    }
    const handleCopyFun = () => {
      const clipboard = new Clipboard('#copy_text')
      clipboard.on('success', e => {
        proxy.$Message({
          message: "copy success",
          type: "success",
        });
        clipboard.destroy() 
      })
      clipboard.on('error', e => {
        proxy.$Message({
          message: "error",
          type: "error",
        });
        clipboard.destroy()
      })
    }

    return {
      ...toRefs(state),
      search,
      switchModel,
      store,
      login,
      logout,
      redirectPage,
      copy_text,
      triggerCopy,
      handleCopyFun,
      showLoginMask,
      closeLoginMask
    };
  },
};
</script>

<style lang="scss" scoped>
.page-header-box{
  position:fixed;
  z-index:50;
  width:100%;
  height:80px;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.9);
  .page-header {
    margin: 0 auto;
    width:1440px;
    min-width:1440px;
    height:80px;
    padding:0 160px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    
    .left-mode{
      height:80px;
      display:flex;
      align-items: center;
      .logo {
        cursor: pointer;
        width:96px;
        img{
          width:100%;
        }
      }
    }


    .right-nav {
      display:flex;
      align-items:center;
      height:80px;
      font-family: D-DINExp;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      .right-nav-item {
        cursor: pointer;
        line-height:62px;
        padding:0 20px;
        z-index:3;
        position:relative;
        span{
          line-height:62px;
          position:relative;
          z-index:3;
        }
        &.nav-hover {
          &::before{
            display:block;
            content:"";
            position:absolute;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:url('@/assets/images/header/selected-bg.png') no-repeat center center;
            background-size:contain;
            opacity: 0;
            z-index:1;
          }
          &:hover{
            &::before{
              transition: opacity 0.5s linear;
              opacity: 1;
            }
          }
        }

        &.action{
          background:url('@/assets/images/header/action_bg.png') no-repeat center center;
          background-size:contain;
          font-family: D-DINExp-Bold;
          font-weight: 700;
          &::before{
            display:none;
          }
        }

        &.user-photo {
          position: relative;
          padding:0;
          .user-photo-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin:0 0 0 112px;
          }
        }

        .theme-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: $bak-color;
          transition: .5s;
          position: relative;
          &-img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            transition: .5s;
          }
        }
      }

      .user-login{
        cursor: pointer;
        margin-right: 0;
        margin-left:43px;
        .mini-button{
          background: #16181D;
        }
      }

    }
  }
  .page-header-phone,.menu-box{
    display:none;
  }
}
</style>

<style lang="scss" >
  .el-input.search-box{
    margin-left:100px;
    width: 300px;
    height: 40px;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    input{
      width: 100%;
      height: 40px;
      line-height:40px;
      background: transparent url("@/assets/images/header/icon-search.png") no-repeat 20px center ;
      background-size:16px 16px;
      padding:0 15px 0 46px;
      border:0;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      font-weight: 400;
    }
  }

  .user-menu-box {
    width: 193px!important;
    font-weight: normal;
    color: #969dae !important;
    border: 0 !important;
    padding: 0 !important;
    .user-menu-list{
      background:#000!important;
      border-radius: 10px!important;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
    }
    .user-menu-item {
      padding:0 20px;
      height:50px;
      line-height:48px;
      box-sizing:border-box;
      cursor: pointer;
      font-family: D-DINExp;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      overflow:hidden;
      &:hover {
        background-color: rgba(40,40,45,0.5);
      }
      &:first-child{
        border-top-left-radius:10px;
        border-top-right-radius:10px;
      }
      &:last-child{
        border-bottom-left-radius:10px;
        border-bottom-right-radius:10px;
      }
      &.account{
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        font-weight: 400;
        div{
          border-bottom: 1px solid rgba(255,255,255,0.3);
        }
      }
    }
    .el-popper__arrow{
      &::before{
        border:0 !important;
        background:#000 !important;
        transform: rotate(-135deg) !important;
      }
    }
  }
</style>
