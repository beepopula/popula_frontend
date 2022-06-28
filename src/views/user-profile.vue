<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- user-info -->
        <div class="user-info" v-if="user.data">
          <img v-if="user.background" class="bg" :src="user.background"/>
          <img v-else class="bg" src="@/assets/images/profile/bg.png"/>
          <div class="btns">
            <div class="btn edit" v-if="accountId == $store.getters.accountId" @click="showEditBasicinfoLayer()"></div>
            <div class="btn share" :data-clipboard-text="shareLink" @click="handleCopyFun()"></div>
          </div>
          <div class="info">
            <img v-if="user.avatar" class="avatar" :src="user.avatar"/>
            <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
            <div class="follow-button" v-if="user.account_id !== $store.getters.accountId">
              <FollowButton 
                :isFollow="user.data.isFollow" 
                :accountId="user.account_id" 
                @follow = "follow"
              />
            </div>
            <div class="name  txt-wrap">{{user.name || user.account_id}}</div>
            <div class="account  txt-wrap">{{user.account_id}}</div>
            <div class="total">
              <div class="total-item" @click="showFollowList('followers')"><span>{{user.data.follows}}</span> Followers</div>
              <div class="total-item" @click="showFollowList('following')"><span>{{user.data.following}}</span> Following</div>
              <div class="total-item"><span>{{user.data.postCount}}</span> Posts</div>
            </div>
            <div class="bio txt-wrap2">{{user.bio}}</div>
            <div class="media-list-box">
              <div class="media-list">
                <!-- Twitter -->
                <a v-if="user.twitter && user.twitter.url" class="media-item" :href="user.twitter.url" target="_blank">
                  <img v-if="user.twitter.verified" class="plat-icon" src="@/assets/images/common/logo-twitter.png"/>
                  <img v-else class="plat-icon" src="@/assets/images/common/logo-twitter-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-twitter-hover.png"/>
                </div>

                <!-- Instagram -->
                <a v-if="user.instagram && user.instagram.url" class="media-item" :href="user.instagram.url" target="_blank">
                  <img v-if="user.instagram.verified" class="plat-icon" src="@/assets/images/common/logo-instagram.png"/>
                  <img v-else class="plat-icon" src="@/assets/images/common/logo-instagram-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-instagram-hover.png"/>
                </div>

                <!-- TikTok -->
                <a v-if="user.tiktok && user.tiktok.url" class="media-item" :href="user.tiktok.url" target="_blank">
                  <img v-if="user.tiktok.verified" class="plat-icon" src="@/assets/images/common/logo-tiktok.png"/>
                  <img v-else class="plat-icon" src="@/assets/images/common/logo-tiktok-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-tiktok-hover.png"/>
                </div>

                <!-- YouTube -->
                <a v-if="user.youtube && user.youtube.url" class="media-item" :href="user.youtube.url" target="_blank">
                  <img v-if="user.youtube.verified" class="plat-icon" src="@/assets/images/common/logo-youtube.png"/>
                  <img v-else class="plat-icon" src="@/assets/images/common/logo-youtube-hover.png"/>
                </a>
                <div v-else class="media-item">
                  <img class="plat-icon" src="@/assets/images/common/logo-youtube-hover.png"/>
                </div>

              </div>
              <div class="btn edit" v-if="accountId == $store.getters.accountId" @click="showEditMediaLayer()"></div>
            </div>
          </div>
        </div>
        <!-- filter-menu  -->
        <div class="filter-menu">
          <div :class="['filter-menu-item',currentTab == 'post' ? 'active' : '']" @click="changeTab('post')">Posts <span v-if="count.post">({{count.post}})</span></div>
          <div :class="['filter-menu-item',currentTab == 'reply' ? 'active' : '']" @click="changeTab('reply')">Reply <span v-if="count.reply">({{count.reply}})</span></div>
          <div :class="['filter-menu-item',currentTab == 'like' ? 'active' : '']" @click="changeTab('like')">Likes <span v-if="count.like">({{count.like}})</span></div>
        </div>
        <!-- list -->
        <div class="list">
          <template v-for="item in list[currentTab]">
            <template v-if="item.postId">
              <CommentItemProfile :item="item" :user="user"/>
            </template>
            <template v-else>
              <PostItem :item="item"/>
            </template>
          </template>
        </div>
        <div class="no-more" v-if="isEnd">
          <div class="no-results"  v-if="list[currentTab]['length'] == 0">
            <img src="@/assets/images/common/emoji-null.png"/>
            No data
          </div>
          <template v-else>No more</template>
        </div>
      </div>
      <!-- right -->
      <div class="right">
        <!-- Joine 10 Communities -->
        <div class="right-mod joined-communities" v-if="joinedCommunities.length>0">
          <div class="title">
            <div class="font20">Communities Joined</div>
            <div class="more" @click="showCommunityList()">More</div>
          </div>  
          <div class="communities">
            <div :class="['community',index%3==2 ? 'mr0' : '']" v-for="(item,index) in joinedCommunities" @click="redirectPage('/community-detail/'+item.communityId,false)">
              <img v-if="item.avatar" class="avatar" :src="item.avatar">
              <img v-else class="avatar" src="@/assets/images/test/community.png">
              <div class="name txt-wrap">{{item.name}}</div>
            </div>
          </div>
        </div>
        <!-- NFTs -->
        <div class="right-mod nft-box" v-if="nfts.lenth>0">
          <div class="title">
            <div class="font20">NFTs</div>
            <div class="more" @click="showNftList()">More</div>
          </div>  
          <div class="nfts">
            <div :class="['nft',index%3==2 ? 'mr0' : '']" v-for="(item,index) in nfts" @click="redirectPage('/detail/'+item.target_hash,false)">
              <img class="avatar" :src="item.metadata.media"/>
            </div>
          </div>
        </div>
        <!-- About -->
        <About/>
      </div>
    </div>

    <!-- follow layer -->
    <div class="elastic-layer follow-layer" v-if="showFollows" @click.self="closeFollowList()">
      <div class="edit-button close" @click="closeFollowList()"></div>
      <div class="follow-box">
        <div class="tab-box">
          <div :class="['tab',followCurrentTab == 'followers' ? 'active' : '']" @click="changeFollowTab('followers')">Followers</div>
          <div :class="['tab',followCurrentTab == 'following' ? 'active' : '']" @click="changeFollowTab('following')">Following</div>
        </div>
        <div v-if="followList[followCurrentTab]['length']>0" class="follow-list" ref="followDiv" @scroll="followScroll()">
          <div class="follow-item" v-for="user in followList[followCurrentTab]" :key="user.data.account_id" @click="redirectPage('/user-profile/'+user.data.account_id,false)">
            <el-popover placement="bottom-start"  trigger="hover" @show="user.showUser=true" @hide="user.showUser=false">
              <template #reference>
                <img v-if="user.data.avatar" class="avatar" :src="user.data.avatar"/>
                <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
              </template>
              <template v-if="user.showUser">
                <UserPopup  :account="user.data.account_id" :hasBtn="false" @login="showLogin=true" />
              </template>
            </el-popover>
            <div class="info">
              <div class="name txt-wrap">{{user.data.name || user.data.account_id}}</div>
              <div class="account txt-wrap">{{user.data.account_id}}</div>
            </div>
            <!-- follow -->
            <div class="follow-button" v-if="user.data.account_id !== $store.getters.accountId" >
              <FollowButton 
                :isFollow="user.data.isFollow" 
                :accountId="user.data.account_id" 
                @follow = "follow"
              />
            </div>
          </div>
          <div class="no-more" v-if="isEndFollow">No more</div>
        </div>
        <div v-else-if="isEndFollow" class="no-results">
          <img src="@/assets/images/common/emoji-null.png"/>
          No data
        </div>
      </div>
    </div>

    <!-- communities layer -->
    <div class="elastic-layer" v-if="showCommunities" @click.self="closeCommunityList()">
      <div class="edit-button close" @click="closeCommunityList()"></div>
      <div class="layer-content">
        <div class="elastic-content">
          <div class="title">Joined Communities</div>
          <div id="community-list" class="community-list" >
            <div v-for="(item,index) in joinedCommunityList" :class="['community-item',index%3==2 ? 'mr0' : '']" @click="redirectPage('/community-detail/'+item.communityId)">
              <img v-if="item.avatar" class="avatar" :src="item.avatar">
              <img v-else class="avatar" src="@/assets/images/test/community.png">
              <div class="name txt-wrap">{{item.name}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- nfts layer -->
    <div class="elastic-layer" v-if="showNfts" @click.self="closeNftList()">
      <div class="edit-button close" @click="closeNftList()"></div>
      <div class="layer-content">
        <div class="elastic-content">
          <div class="title">
            NFTs
            <div class="filter-menu">
              <div :class="['filter-menu-item',nftCurrentTab == 'collected' ? 'active' : '']" @click="changeNftTab('collected')">Collected {{nftCount['collected']}}</div>
              <div :class="['filter-menu-item',nftCurrentTab == 'created' ? 'active' : '']" @click="changeNftTab('created')">Created {{nftCount['created']}}</div>
            </div>
          </div>
          <div id="nft-list" class="nft-list" >
            <div v-for="(item,index) in nftList[nftCurrentTab]" :class="['nft-item',index%4==3 ? 'mr0' : '']" @click="redirectPage('/detail/'+item.target_hash)">
              <img class="media" :src="item.metadata.media"/>
              <div class="name txt-wrap">{{item.metadata.title}}</div>
              <div class="collection txt-wrap">{{item.contract_id}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ProfileEditBasicinfo -->
    <template v-if="showEditBasicinfo">
      <ProfileEditBasicinfo :accountId="user.account_id" :editInfo="editBasicinfo" @updateInfo="updateBasicinfo" @closeEditLayer="showEditBasicinfo=false"/>
    </template>
    <!-- ProfileEditMedia -->
    <template v-if="showEditMedia">
      <ProfileEditMedia :accountId="user.account_id" :editInfo="editMedia" @updateInfo="updateMedia" @closeEditLayer="showEditMedia=false"/>
    </template>

    <!-- suspend -->
    <suspend @postSuccess="postSuccess()" />

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>


  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import NftContract from "@/contract/NftContract";
  import FollowButton from "@/component/follow-button.vue";
  import PostItem from '@/component/post-item.vue';
  import UserPopup from '@/component/user-popup.vue';
  import CommentItemProfile from '@/component/comment-item-profile.vue';
  import About from '@/component/about.vue';
  import loginMask from "@/component/login-mask.vue";
  import suspend from "@/component/suspend.vue";
  import ProfileEditBasicinfo from "@/component/profile-edit-basicinfo.vue";
  import ProfileEditMedia from "@/component/profile-edit-media.vue";
  import ClipboardJS from 'clipboard';

  export default {
    components: {
      FollowButton,
      PostItem,
      CommentItemProfile,
      UserPopup,
      About,
      loginMask,
      suspend,
      ProfileEditBasicinfo,
      ProfileEditMedia
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const nftContract = new NftContract(store.state.account);

      const state = reactive({
        accountId : "",
        user: {}, 
        //list
        currentTab:"",
        list:{
          post:[],
          reply:[],
          like:[]
        },
        count:{
          post:0,
          reply:0,
          like:0,
        },
        page:0,
        limit:10,
        isEnd:false,
        isLoading:false,
        //folllow
        showFollows:false,
        followCurrentTab:'',
        isLoadingFollow:false,
        isEndFollow:false,
        followList:{
          followers:[],
          following:[]
        },
        //community
        joinedCommunities:[],
        joinedCommunityList:[],
        showCommunities:false,
        //nft
        nfts:[],
        showNfts:false,
        nftCurrentTab:'',
        nftList:{
          collected:[],
          created:[],
        },
        nftCount:{
          collected:0,
          created:0,
        },
        // pageNft:0,
        // limitNft:10,
        // isEndNft:false,
        // isLoadingNft:false,
        //edit
        showEditBasicinfo:false,
        editBasicinfo:{},
        showEditMedia:false,
        editMedia:{},
        //other
        shareLink:`${window.location.protocol}//${window.location.host}/user-profile/${route.params.id || store.getters.accountId}`,
        showLogin:false,
      });

      //init
      const init = async () => {
          state.accountId = route.params.id || store.getters.accountId;
          const res = await proxy.$axios.profile.get_user_info({
            accountId:state.accountId,
            currentAccountId: store.getters.accountId || ''
          });
          if(res.success){
            //media
            state.mediaList = res.data.media;
            // if(res.data.media){
            //   const media = [];
            //   res.data.media.forEach(item=>{
            //     media[item.name] = {
            //       url:item.url,
            //       verified:item.verified
            //     }
            //   })
            //   state.mediaList.forEach(item=>{
            //     item.url = media[item.name] ? media[item.name]['url'] : "";
            //     item.verified = media[item.name] ? media[item.name]['verified'] : false;
            //   })
            // }

            state.user = res.data;
            state.joinedCommunityList = state.user.data.joinedCommunities;
            state.joinedCommunities = state.joinedCommunityList.slice(0,6);
          }

          changeTab('post');
          initCount();
          initNfts();
      }

      const initNfts = async () => {
        const collected = await proxy.$axios.profile.get_user_nfts({
          accountId:state.accountId,
          type:'collected'
        });

        const collectedList = [];
        for(let i = 0;i<collected.data.length;i++){
          const item = collected.data[i];
          const res = await store.state.viewAccount.viewFunction(item.contract_id, "nft_token", {token_id: item.token_id}); 
          collectedList.push({...res,contract_id:item.contract_id});
        }
         // const token_series_id = item.token_id.split(':')[0];
          // const nft_info = await nftContract.getSeries({token_series_id});

        state.nftCount.collected = collected.data.length;
        state.nftList.collected = collectedList;
        
        if(state.nftList.collected.length<4){
          await getCreated();
          state.nfts = state.nftList.collected.concat(state.nftList.created).slice(0,6)
        }else{
          state.nfts = state.nftList.collected;
        }
      }

      const initCount = async () => {
        const replies = await proxy.$axios.profile.get_user_replies({
          page:0,
          limit:1,
          accountId:state.accountId,
          currentAccountId: store.getters.accountId || ''
        });
        state.count.reply = replies.count;
        const likes = await proxy.$axios.profile.get_user_likes({
          page:0,
          limit:1,
          accountId:state.accountId,
          currentAccountId: store.getters.accountId || ''
        });
        state.count.like = likes.count;
      }

      const follow = (res) => {
        state.user.data.follows = res.isFollow ? state.userDetail.data.follows + 1 : state.userDetail.data.follows -1;
      }

      const postSuccess = () => {
        changeTab('post');
      }


      //changeTab
      const changeTab = async (tab) => {
        // if(state.currentTab == tab) return;
        //reset data
        state.currentTab = tab;
        state.list[state.currentTab] = [];
        state.page = 0;
        state.isEnd = false;
        //request
        const res = await getList();
        state.list[state.currentTab] = res.data;
        state.count[state.currentTab] = res.count;
      }

      //getList
      const getList = async () => {
        state.isLoading = true;
        let res = null
        if(state.currentTab=="post"){
          res = await proxy.$axios.profile.get_user_posts({
            page:state.page,
            limit:state.limit,
            accountId:state.accountId,
            currentAccountId: store.getters.accountId || ''
          });
        }else if(state.currentTab=="reply"){
          res = await proxy.$axios.profile.get_user_replies({
            page:state.page,
            limit:state.limit,
            accountId:state.accountId,
            currentAccountId: store.getters.accountId || ''
          });
        }else if(state.currentTab=="like"){
          res = await proxy.$axios.profile.get_user_likes({
            page:state.page,
            limit:state.limit,
            accountId:state.accountId,
            currentAccountId: store.getters.accountId || ''
          });
        }
        state.isLoading = false;
        if(res && res.success){
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
        if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
          const res = await getList();
          state.list[state.currentTab] = state.list[state.currentTab].concat(res.data);
        }
      }

      //redirectPage
      const redirectPage = (path,need_login=true) => {
        if(!store.getters.isLogin && need_login){
          state.showLogin = true
        }else{
          router.push({
            path
          });
        }
      };

      //follow list
      const showFollowList = async (type) => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.followCurrentTab = type;
        state.showFollows = true;
        state.followPage = 0;
        state.isEndFollow = false;
        state.followList[state.followCurrentTab] =  await getFollowList();
      }
      const closeFollowList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showFollows = false;
      }
      const changeFollowTab  = async (type) => {
        if(state.followCurrentTab == type || state.isLoadingFollow){
          return;
        }
        state.followCurrentTab = type;
        state.followPage = 0;
        state.isEndFollow = false;
        state.followList[state.followCurrentTab] =  await getFollowList();
      }
      const getFollowList = async () => {
        state.isLoadingFollow = true;
        let result = [];
        if(state.followCurrentTab=="followers"){
          const res = await proxy.$axios.profile.get_user_followers({
            accountId:state.accountId,
            currentAccountId:store.getters.accountId || '',
            page:state.followPage,
            limit:10
          });
          if(res.success){
            state.followPage++;
            result = res.data;
          }
        }else{
          const res = await proxy.$axios.profile.get_user_following({
            accountId:state.accountId,
            currentAccountId:store.getters.accountId || '',
            page:state.followPage,
            limit:10
          });
          if(res.success){
            state.followPage++;
            result = res.data;
          }
        }
        if(result.length<10){
          state.isEndFollow = true;
        }
        state.isLoadingFollow = false;
        return result;
      }
      const followDiv = ref();
      const followScroll = async () => {
        const followBox = followDiv.value;
        if(((followBox.scrollTop + window.innerHeight - 192) >= followBox.scrollHeight-200) && !state.isLoadingFollow && !state.isEndFollow){
          const res = await getFollowList();
          state.followList[state.followCurrentTab] = state.followList[state.followCurrentTab].concat(res);
        }
      }

      //edit
      const showEditBasicinfoLayer = () => {
        state.editBasicinfo = {
          name:state.user.name,
          avatar:state.user.avatar,
          background:state.user.background,
          bio:state.user.bio,

          twitter:state.user.twitter || {url:'',verified:false},
          instagram:state.user.instagram || {url:'',verified:false},
          youtube:state.user.youtube || {url:'',verified:false},
          tiktok:state.user.tiktok || {url:'',verified:false}
        };
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showEditBasicinfo = true;
      }
      const updateBasicinfo = (info) => {
        state.user.name = info.name;
        state.user.avatar = info.avatar;
        state.user.background = info.background;
        state.user.bio = info.bio;

        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditBasicinfo = false;
      }
      const showEditMediaLayer = () => {
        state.editMedia = {
          twitter:state.user.twitter || {url:'',verified:false},
          instagram:state.user.instagram || {url:'',verified:false},
          youtube:state.user.youtube || {url:'',verified:false},
          tiktok:state.user.tiktok || {url:'',verified:false},

          bio:state.user.bio,
        };
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showEditMedia = true;
      }
      const updateMedia = (info) => {
        state.user.twitter = info.twitter;
        state.user.instagram = info.instagram;
        state.user.youtube = info.youtube;
        state.user.tiktok = info.tiktok;

        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditMedia = false;
      }




      //community-list
      const showCommunityList  = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showCommunities = true;
      }
      const closeCommunityList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showCommunities = false;
      }

      //nft-list
      const showNftList  = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        changeNftTab('collected');
        state.showNfts = true;

        //getdata
        if(state.nftList.collected.length>=4){
          await getCreated();
        }
      }
      const closeNftList = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showNfts = false;
      }
      const changeNftTab = async (tab) => {
        if(state.nftCurrentTab == tab) return;
        //reset data
        state.nftCurrentTab = tab;
      }

      const getCreated = async () => {
        const created = await proxy.$axios.profile.get_user_nfts({
          accountId:state.accountId,
          type:'created'
        });
        const createdList = [];
        for(let i = 0;i<created.data.length;i++){
          const item = created.data[i];
          const res = await store.state.viewAccount.viewFunction(item.contract_id, "nft_token", {token_id: item.token_id}); 
          // const nft_info = await nftContract.getSeries({token_series_id});
          createdList.push({...res,contract_id:item.contract_id});;
          // const token_series_id = item.token_id.split(':')[0];
          // try{
          //   const nft_info = await nftContract.getSeries({token_series_id});
          //   createdList.push(nft_info);
          // }catch(e){
          //   console.log(e,token_series_id);
          // }
        }
        state.nftCount.created = created.data.length;
        state.nftList.created = createdList;
      }

      //share
      const handleCopyFun = () => {
        const clipboard = new ClipboardJS('.btn.share')
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



      //LoginMask
      const showLoginMask = () => {
        state.showLogin = true
      }
      const closeLoginMask = () => {
        state.showLogin = false
      }

      return {
        ...toRefs(state),
        init,
        follow,
        postSuccess,
        changeTab,
        handleScroll,
        redirectPage,
        showFollowList,
        closeFollowList,
        changeFollowTab,
        followDiv,
        followScroll,
        showEditBasicinfoLayer,
        updateBasicinfo,
        showEditMediaLayer,
        updateMedia,
        showCommunityList,
        closeCommunityList,
        showNftList,
        closeNftList,
        changeNftTab,
        handleCopyFun,
        showLoginMask,
        closeLoginMask,
      };
    },
    mounted(){
      this.init();
      window.addEventListener('scroll',this.handleScroll);
    },
  }
</script>

<style lang="scss" scoped>
  .main{
    .left{
      padding-right:20px;
      .user-info{
        background: #28282D;
        border-radius: 24px;
        position:relative;
        .bg{
          width:690px;
          height:240px;
          object-fit: cover;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
        }
        .btns{
          height:24px;
          position: absolute;
          top:20px;
          right:20px;
          display:flex;
          align-items: center;
          .btn{
            width:24px;
            height:24px;
            cursor:pointer;
            &.edit{
              background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
              background-size:24px 24px;
            }
            &.share{
              margin-left:40px;
              background:url("@/assets/images/profile/icon-share.png") no-repeat right center;
              background-size:24px 24px;
            }
          }
        }
        .info{
          position: relative;
          padding:70px 20px 20px;
          .avatar{
            width: 80px;
            height: 80px;
            border-radius:50%;
            position: absolute;
            top:-40px;
            left:20px;
            object-fit: cover;
          }
          .follow-button{
            position:absolute;
            top:75px;
            right:20px;
          }
          .name{
            line-height: 22px;
            font-family: D-DINExp-Bold;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            padding-right:20px;
          }
          .account{
            margin-top:8px;
            font-family: D-DINExp;
            font-size: 14px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
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
              cursor: pointer;
              &:last-child{
                cursor: default;
              }
              span{
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 700;
              }
            }
          }
          .bio{
            margin-top:20px;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: justify;
            line-height: 24px;
            font-weight: 400;
          }
          .media-list-box{
            height:24px;
            margin-top:20px;
            display: flex;
            align-items: center;
            justify-content:space-between;
            .media-list{
              display:flex;
              .media-item{
                width:24px;
                margin-right:30px;
                img{
                  height:24px;
                }
              }
            }
            .edit{
              width:24px;
              height:24px;
              cursor:pointer;
              background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
              background-size:24px 24px;
              
            }
          }
        }
      }
      .list{
        background: #28282D;
        border-radius: 24px;
        padding:0 20px;
        margin-top:20px;
      }
    }
    .right{
      .right-mod{
        background: #000000;
        border-radius: 24px;
        padding: 20px;
        margin-bottom:20px;
        .title{
          display: flex;
          align-items: center;
          justify-content:space-between;
          .more{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 400;
            padding-right:18px;
            background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
            background-size:14px 14px;
            cursor:pointer;
          }
        }
      }
      .joined-communities{
        .communities{
          display: flex;
          flex-wrap:wrap;
          margin-bottom: 10px;
          .community{
            margin-top:30px;
            margin-right:30px;
            width:72px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            &.mr0{
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
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              line-height:16px;
            }
          }
        }
      }
      .nft-box{
        .nfts{
          display: flex;
          flex-wrap:wrap;
          .nft{
            margin-top:30px;
            margin-right:12px;
            width:84px;
            cursor: pointer;
            &.mr0{
              margin-right:0;
            }
            img{
              width:84px;
              height:84px;
              border-radius: 8px;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
  .follow-layer{
    background: rgba(0,0,0,0.56);
    .follow-box{
      position:absolute;
      top:60px;
      left:50%;
      transform:translateX(-50%);
      width: 690px;
      height: calc(100vh - 120px);
      background: #28282D;
      border-radius: 24px;
      .tab-box{
        display:flex;
        align-items: center;
        height:72px;
        padding-top:10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        .tab{
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: center;
          font-weight: 700;
          width:50%;
          line-height:62px;
          text-align: center;
          position: relative;
          cursor: pointer;
          &.active{
            &::after{
              display:block;
              content:"";
              position: absolute;
              left:50%;
              transform:translateX(-50%);
              bottom:0;
              width: 90px;
              height: 4px;
              background: #FED23C;
              border-radius: 2px;

            }
          }
        }
      }
      .follow-list{
        height: calc(100vh - 192px);
        overflow-y: scroll;
        padding-top:20px;
        .follow-item{
          margin-bottom:30px;
          height:60px;
          display:flex;
          align-items: center;
          padding:0 20px;
          cursor: pointer;
          position:relative;
          .avatar{
            width: 60px;
            height: 60px;
            border-radius:50%;
            object-fit: cover;
          }
          .info{
            margin-left:15px;
            width:300px;
            .name{
              display:inline-block;
              max-width:300px;
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:17px;
            }
            .account{
              margin-top:10px;
              font-family: D-DINExp;
              font-size: 16px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              line-height:17px;
            }
          }
          .follow-button{
            position: absolute;
            top:10px;
            right:20px;
          }
        }
      }
    }
  }
  .elastic-content{
    width:688px;
    margin:0 auto;
    .title{
      font-family: D-DINExp-Bold;
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      display: flex;
      justify-content:space-between;
      .filter-menu{
        margin-top:0;
      }
    }
    .community-list{
      display: flex;
      flex-wrap: wrap;
      margin-top:30px;
      .community-item{
        margin-bottom:20px;
        margin-right:20px;
        padding:0 20px;
        width: 214px;
        height: 80px;
        background: #28282D;
        border-radius: 10px;
        display:flex;
        align-items: center;
        position:relative;
        cursor:pointer;
        &.mr0{
          margin-right:0;
        }
        .avatar{
          width: 40px;
          height: 40px;
          border-radius: 10px;
          object-fit: cover;
        }
        .name{
          width:124px;
          font-family: D-DINExp-Bold;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          margin-left:12px;
        }
      }
    }
    .nft-list{
      display: flex;
      flex-wrap: wrap;
      margin-top:30px;
      .nft-item{
        margin-bottom:30px;
        margin-right:20px;
        width: 155px;
        height: 211px;
        display:flex;
        flex-direction: column;
        cursor:pointer;
        &.mr0{
          margin-right:0;
        }
        .media{
          width: 155px;
          height: 155px;
          border-radius: 10px;
          object-fit: cover;
        }
        .name{
          margin-top:15px;
          width:124px;
          font-family: D-DINExp-Bold;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:20px;
        }
        .collection{
          margin-top:4px;
          opacity: 0.8;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          line-height:16px;
        }
      }
    }
  }
  .no-results{
    padding:80px 0;
    background: #28282D;
    border-radius: 24px;
    font-family: D-DINExp;
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
    line-height:16px;
    img{
      display:block;
      width: 60px;
      height: 60px;
      margin:0 auto 12px;
    }
  }
</style>
