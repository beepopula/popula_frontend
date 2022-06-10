<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <div class="post-detail">
          <!-- Community -->
          <div class="Community-info" v-if="postCommunity.data">
            <img v-if="postCommunity.avatar" @click="redirectPage('/community-detail/'+postCommunity.communityId)" class="avatar" :src="postCommunity.avatar"/>
            <img v-else @click="redirectPage('/community-detail/'+postCommunity.communityId)" class="avatar" src="@/assets/images/test/community.png"/>
            <div class="info">
              <div class="name" @click="redirectPage('/community-detail/'+postCommunity.communityId)">{{postCommunity.name}}</div>
              <div class="creator" @click="redirectPage('/user-profile/'+postCommunity.accountId,false)">@{{postCommunity.accountId}}</div>
              <div class="total">
                <div class="total-item"><span>{{postCommunity.data.membersCount}}</span> Members</div>
                <div class="total-item"><span>{{postCommunity.data.postCount}}</span> Posts</div>
              </div>
            </div>
            <div v-if="postCommunity.communityId != $store.state.nearConfig.MAIN_CONTRACT" class="mini-button-border join-button" @click="changeJoinCommunity()">
              <div class="mini-button" v-if="postCommunity.data.isJoin">  Joined  </div>
              <div class="mini-button" v-else>  Join  </div>
            </div>
          </div>
          <!-- PostItem  -->
          <template v-if="postDetail.target_hash">
            <PostItem 
              :item="postDetail" 
              :commentC="commentCount" 
              :from="'detail'" 
              @changeAccess="isAccess=true"
              @focus="focusComment=!focusComment"
            />
          </template>
        </div>
        <!-- Comment  -->
        <div style="margin-top:20px;"></div>
        <Comment 
          :targetHash="$route.params.id" 
          :communityId="postDetail.receiverId" 
          :methodName="postDetail.methodName"
          :focus="focusComment"
          @comment="comment"
        />

        <!-- All Comments -->
        <template v-if="postDetail.methodName!='add_encrypt_post' || isAccess">
          <div class="all-comments-title">
            <div class="font20">Comments({{commentCount}})</div>
            <div class="filter-menu">
              <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
              <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">New</div>
            </div>
          </div>
          <div class="all-comments">
            <template v-for="item in comments[currentTab]">
              <CommentItem :level="1" :post="postDetail" :item="item" :defaultComment="$route.query.comment" @comment="comment"/>
            </template>
          </div>

          <div class="no-more" v-if="isEnd">
            <template v-if="commentCount == 0">No comments</template>
            <template v-else>No more comments</template>
          </div>
        </template>
      </div>
      <!-- right -->
      <div class="right">
        <!-- User Info -->
        <div class="creator-info" v-if="userDetail.account_id" >
          <!-- avatar-follow -->
          <div @click="redirectPage('/user-profile/'+userDetail.account_id,false)">
            <div class="avatar-follow">
              <img v-if="userDetail.avatar" class="avatar" :src="userDetail.avatar"/>
              <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
              <!-- follow -->
              <div class="follow-button" v-if="userDetail.account_id !== $store.getters.accountId">
                <FollowButton 
                  :isFollow="userDetail.data.isFollow" 
                  :accountId="userDetail.account_id" 
                  :background="'#000'"
                  @follow = "follow"
                  :position="'right'"
                />
              </div>
            </div>

            <!-- name-account -->
            <div class="name txt-wrap">{{userDetail.name}}</div>
            <div class="account txt-wrap">{{userDetail.account_id}}</div>
          </div>
          
          <!-- account-total -->
          <div class="total">
            <div class="total-item"><span>{{userDetail.data.follows}}</span> Followers</div>
            <div class="total-item"><span>{{userDetail.data.following}}</span> Following</div>
            <div class="total-item"><span>{{userDetail.data.postCount}}</span> Posts</div>
          </div>

          <!-- bio -->
          <div class="bio txt-wrap2">{{userDetail.bio}}</div>

          <!-- communities -->
          <div class="communities" v-if="joinedCommunities.length>0">
            <div class="community-item" v-for="item in joinedCommunities" @click="redirectPage('/community-detail/'+item.communityId,false)">
              <img v-if="item.avatar" class="avatar" :src="item.avatar">
              <img v-else class="avatar" src="@/assets/images/test/community.png">
              <div class="name txt-wrap">{{item.name}}</div>
            </div>
          </div>
        </div>
        <!-- About -->
        <About/>
      </div>
    </div>

    <!-- suspend -->
    <div class="suspend">
      <div id="backTop" class="back-top" @click="backTop()"></div>
      <div class="button-box" @click="popUp()">
        <div class="button">
          <img src="@/assets/images/post-item/icon-comment.png"/>
        </div>
      </div>
      <div class="elastic-layer suspend-elastic-layer" v-if="showLayer" @click.self="closeSuspendLayer()">
        <div class="edit-button close" @click="closeSuspendLayer()"></div>
        <div class="elastic-layer-content">
          <Comment 
            :targetHash="$route.params.id" 
            :communityId="postDetail.receiverId" 
            :methodName="postDetail.methodName"
            @comment="comment()"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { ref, reactive, toRefs, getCurrentInstance} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import { executeMultipleTransactions,generateAccessKey } from '@/utils/transaction';
import { getGas} from '../utils/util';
import Post from '@/component/post.vue';
import PostItem from '@/component/post-item.vue';
import Comment from '@/component/comment.vue';
import CommentItem from '@/component/comment-item.vue';
import CommunityItem from '@/component/community-item.vue';
import About from '@/component/about.vue';
import LoginMask from "@/component/login-mask.vue";
import FollowButton from "@/component/follow-button.vue";
export default {
  components: {
    PostItem,
    Comment,
    CommentItem,
    About,
    LoginMask,
    FollowButton
  },
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      postCommunity:{},
      postDetail:{},
      userDetail:{},
      joinedCommunities:[],
      isAccess:false,
      //comment
      currentTab:"",
      comments:{
        hot:[],
        new:[]
      },
      commentCount:0,
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
      //other
      showLogin:false,
      showLayer:false,
      focusComment:false
    })

    const init = async () => {
      //detail
      const res = await proxy.$axios.post.get_post_detail({
        postId:route.params.id,
        accountId:store.getters.accountId || ''
      });
      if(res.success){
        state.postCommunity = res.data.postCommunity;
        state.postDetail = res.data.post;
        state.userDetail = res.data.user;
        state.joinedCommunities = res.data.JoinedCommunities.slice(0,3);
      }
      //comment
      changeTab('hot');
    };

    //changeJoinCommunity
    const changeJoinCommunity = async () => {
      if(!store.getters.isLogin){
        state.showLogin = true
      }else{
        try{
          const method = state.postCommunity.data.isJoin ? 'quit' : 'join';
          const taskTransaction = {
            receiverId: state.postDetail.receiverId,
            actions: [{
              kind: "functionCall",
              methodName: method,
              args: {},
              deposit: "20000000000000000000000",
              gas: getGas().toString()
            }]
          }
          const accessKey = await generateAccessKey(store.getters.accountId, state.postDetail.receiverId)
          const accessKeyTransaction = {
            receiverId: store.getters.accountId,
            actions: [{
              kind: "addKey",
              publicKey: accessKey.publicKey,
              accessKey: accessKey.accessKey
            }]
          }
          const result = await executeMultipleTransactions(store.state.account, [taskTransaction, accessKeyTransaction]);
          if(result){
            state.postCommunity.data.isJoin = !state.postCommunity.data.isJoin;
          }
        }catch(e){
          const message = state.postCommunity.data.isJoin ? 'Quit Failed' : 'Join Failed';
          proxy.$Message({
            message,
            type: "error",
          });
          console.log(message+" error:"+e);
        }
      }
    }

    const follow = (res) => {
      state.userDetail.data.follows = res.isFollow ? state.userDetail.data.follows + 1 : state.userDetail.data.follows -1;
    }


    const closeSuspendLayer = () => {
      document.getElementsByTagName('body')[0].classList.remove("fixed");
      state.showLayer=false;
    }
    //comment
    const comment = (res) => {
      closeSuspendLayer();
      state.commentCount += 1;
      setTimeout(()=>{
        changeTab('new');
      },1000);
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //changeTab
    const changeTab = async (tab) => {
      // if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.comments[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      //request
      state.comments[state.currentTab] = await getComments();
    }

    //getComments
    const getComments = async () => {
      state.isLoading = true;
      const res = await proxy.$axios.comment.get_comment_list({
        postId:route.params.id,
        type: state.currentTab,
        page:state.page,
        limit:state.limit,
        accountId:store.getters.accountId || ''
      });
      state.isLoading = false;
      if(res.success){
        if(res.data.length==0){
          state.isEnd = true;
        }
        state.commentCount = res.count;
        state.page += 1;
        return res.data;
      }
      return [];
    }

    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
        const res = await getComments();
        state.comments[state.currentTab] = state.comments[state.currentTab].concat(res);
      }
    }

    //redirectPage
    const redirectPage = (path,need_login=true) => {
      if(!store.getters.isLogin && need_login){
        state.showLogin = true
      }else{
        router.push(path);
      }
    };

    //backTop
    const backTop = () => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    //pop up
    const popUp = () => {
      if(!store.getters.isLogin){
        state.showLogin = true;
      }else{
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showLayer = true;
      }
    }

    return {
      ...toRefs(state),
      init,
      changeJoinCommunity,
      follow,
      comment,
      showLoginMask,
      closeLoginMask,
      changeTab,
      handleScroll,
      redirectPage,
      backTop,
      popUp,
      closeSuspendLayer
    }


  },
  mounted(){
    if(this.$route.query.comment){
      this.$router.push({query: {comment:this.$route.query.comment}});
    }else{
      this.$router.push({query: {}});
    }
    this.init();
    window.addEventListener('scroll',this.handleScroll);
  }
}
</script>

<style lang="scss" scoped>
.main {
  .left{
    padding-right:20px;
    .post-detail{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      .Community-info{
        background: #28282D;
        padding:20px 0;
        display:flex;
        align-items: center;
        position: relative;
        .avatar{
          width: 90px;
          height: 90px;
          border-radius: 16px;
          cursor:pointer;
          object-fit: cover;
        }
        .info{
          margin-left:30px;
          .name{
            line-height: 22px;
            font-family: D-DINExp-Bold;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            cursor:pointer;
          }
          .creator{
            margin-top:8px;
            opacity: 0.5;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            cursor:pointer;
          }
          .total{
            margin-top:20px;
            display:flex; 
            .total-item{
              margin-right:30px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              span{
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 700;
              }
            }
          }
        }
        .join-button{
          position: absolute;
          top:47px;
          right:20px;
        }
      }
    }

    .all-comments{
      margin-top:20px;
      padding: 0 20px;
      background: #28282D;
      border-radius: 24px;
    }
  }
  .right{
    .creator-info{
      margin-bottom:20px;
      padding:20px;
      background: #000000;
      border-radius: 24px;
      .avatar-follow{
        display:flex;
        justify-content:space-between;
        align-items:center;
        .avatar{
          width: 80px;
          height: 80px;
          border-radius:50%;
          cursor:pointer;
          object-fit: cover;
        }
        .follow-button{
          position: relative;
        }
      }
      .name{
        margin-top:20px;
        font-family: D-DINExp-Bold;
        font-size: 18px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        cursor:pointer;
      }
      .account{
        margin-top:4px;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        cursor:pointer;
      }
      .total{
        margin-top:20px;
        display:flex; 
        justify-content:space-between;
        .total-item{
          margin-right:30px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          span{
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            display:block;
            margin-bottom:4px;
          }
        }
      }
      .bio{
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: justify;
        line-height: 22px;
        font-weight: 400;
        margin-top:20px;
      }
      .communities{
        margin-top:20px;
        padding:20px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 16px;
        display:flex;
        
        .community-item{
          width:60px;
          display:flex;
          flex-direction: column;
          align-items: center;
          margin-right:30px;
          cursor:pointer;
          &:last-child{
            margin-right:0;
          }
          .avatar{
            width:40px;
            height:40px;
            border-radius: 8px;
            object-fit: cover;
          }
          .name{
            margin-top:12px;
            width:60px;
            line-height:16px;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
          }
        }
      }
    }
  }
}

.all-comments-title{
  margin-top:60px;
  height:38px;
  display:flex;
  justify-content:space-between;
  align-items: center;
  .filter-menu{
    margin-top:0;
  }
}

</style>
