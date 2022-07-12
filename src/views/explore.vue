<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- Post -->
        <Post :location="'explore'" @postSuccess="postSuccess()"/>
        <!-- PostItem  -->
        <div class="filter-menu">
          <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
          <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">
            New
            <div class="unread-count" v-if="postCount.new">{{postCount.new}}</div>
          </div>
          <div v-if="$store.getters.isLogin" :class="['filter-menu-item',currentTab == 'follow' ? 'active' : '']" @click="changeTab('follow')">
            Follow
            <div class="unread-count" v-if="postCount.follow">{{postCount.follow}}</div>
          </div>
        </div>

        <div class="post-list">
          <template v-for="item in postList[currentTab]">
            <PostItem :item="item" @changeList="changeList(item)"/>
          </template>
        </div>

        <div class="no-more" v-if="isEnd">
          <template v-if="postList[currentTab]['length'] == 0">No posts</template>
          <template v-else>No more posts</template>
        </div>
      </div>
      <!-- right -->
      <div class="right">
        <!-- New Communities -->
        <div class="font20">New Communities</div>
        <div class="new-communities">
          <template v-for="item in communities">
            <CommunityItem :item="item"/>
          </template>
          <div class="button-border all-communities-button" @click="redirectPage('/communities')">
            <div class="button">All Communities</div>
          </div>
        </div>
        <!-- About -->
        <About/>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>

  <!-- suspend -->
  <suspend @postSuccess="postSuccess()" />
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import Post from '@/component/post.vue';
import PostItem from '@/component/post-item.vue';
import CommunityItem from '@/component/community-item.vue';
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
import suspend from "@/component/suspend.vue";
export default {
  components: {
    Post,
    PostItem,
    CommunityItem,
    About,
    LoginMask,
    suspend
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      currentTab:"",
      postList:{
        hot:[],
        new:[],
        follow:[]
      },
      postCount:{
        hot:0,
        new:0,
        follow:0
      },
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
      communities:[],
    });

    const init = () => {
      getCommunities();
      changeTab('hot');

      //unReadCount
      initUnreadCount();
    }

    //getCommunities
    const getCommunities = async () => {
      const res = await proxy.$axios.community.get_community_list({
        type:'new',
        page:0,
        limit:3,
        accountId:store.getters.accountId || ''
      });
      if(res.success){
        state.communities =  res.data;
      }
    }

    //changeTab
    const changeTab = async (tab) => {
      if(state.isLoading) return;
      // if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.postList[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      state.postCount[state.currentTab] = 0;
      //request
      const res = await getPosts();
      state.postList[state.currentTab] = res.data;
    }

    //getPosts
    const getPosts = async () => {
      state.isLoading = true;
      const res = await proxy.$axios.post.get_post_list({
        type: state.currentTab,
        page:state.page,
        limit:state.limit,
        accountId:store.getters.accountId || ''
      });
      state.isLoading = false;
      if(res.success){
        if(state.page==0 && state.currentTab=='new' && res.data.length>0){
          localStorage.setItem("lastPostId",res['data'][0]['target_hash']);
          localStorage.removeItem("commLastPostId");
        }
        if(res.data.length==0){
          state.isEnd = true;
        }
        state.page += 1;
        return res;
      }
      return {
        data:[],
        count:0
      };
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd){
        const res = await getPosts();
        state.postList[state.currentTab] = state.postList[state.currentTab].concat(res.data);
      }
    }

    //unread post count
    const initUnreadCount = async () => {
      const lastPostId = localStorage.getItem("lastPostId") || '';
      const resNew = await proxy.$axios.post.get_post_list({
        type: 'new',
        page:0,
        limit:10,
        lastPostId:lastPostId,
      });
      if(lastPostId){
        // const resFollow = await proxy.$axios.post.get_post_list({
        //   type: 'follow',
        //   page:0,
        //   limit:10,
        //   lastPostId:lastPostId,
        // });
        state.postCount['new'] = resNew.unReadCount;
        // state.postCount['follow'] = resFollow.unReadCount;
      }
      if(resNew.data && resNew.data.length>0){
        localStorage.setItem("lastPostId",resNew['data'][0]['target_hash']);
        localStorage.removeItem("commLastPostId");
      }
    }

    //changeList 
    const changeList = (item) => {
      state.postList[state.currentTab].forEach(i=>{
        console.log(i,item);
        if(i==item){
          i.isComment = true;
        }else{
          i.isComment = false;
        }
      })
    }

    //redirectPage
    const redirectPage = (path,need_login=true) => {
      if(!store.getters.isLogin && need_login){
        state.showLogin = true
      }else{
        router.push(path);
      }
    };

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //postSuccess
    const postSuccess = () => {
      changeTab('new');
    }

    return {
      ...toRefs(state),
      init,
      changeTab,
      handleScroll,
      redirectPage,
      changeList,
      showLoginMask,
      closeLoginMask,
      postSuccess
    }


  },
  mounted(){
    this.$router.push({query: {}});
    this.init();
    window.addEventListener('scroll',this.handleScroll);
  }
}
</script>

<style lang="scss" scoped>
.main {
  .left{
    padding-right:20px;
    .post-list{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      margin-top:20px;
    }
  }
  .right{
    .new-communities{
      .community-item{
        width:320px;
      }
      .all-communities-button{
        margin:30px auto 60px;
      }
    }
  }
}
</style>
