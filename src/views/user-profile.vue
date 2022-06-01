<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <!-- user-info -->
        <div class="user-info" v-if="user.data">
          <img class="bg" src="@/assets/images/profile/bg.png"/>
          <div class="info">
            <img v-if="user.avatar" class="avatar" :src="user.avatar"/>
            <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
            <div class="follow-button" v-if="user.account_id !== $store.getters.accountId">
              <FollowButton 
                :isFollow="user.data.isFollow" 
                :accountId="user.account_id" 
                :background="'#000'" 
                @follow = "follow"
              />
            </div>
            <div class="name  txt-wrap">{{user.name || user.account_id}}</div>
            <div class="account  txt-wrap">{{user.account_id}}</div>
            <div class="total">
              <div class="total-item"><span>{{user.data.follows}}</span> Followers</div>
              <div class="total-item"><span>{{user.data.following}}</span> Following</div>
              <div class="total-item"><span>{{user.data.postCount}}</span> Posts</div>
            </div>
            <div class="bio txt-wrap2">{{user.bio}}</div>
            <div class="media-list">
              <a class="media-item" href="" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-link-hover.png"/>
              </a>
              <a class="media-item" href="" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-twitter-hover.png"/>
              </a>
              <a class="media-item" href="" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-instagram-hover.png"/>
              </a>
              <a class="media-item" href="" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-youtube-hover.png"/>
              </a>
              <a class="media-item" href="" target="_blank">
                <img class="plat-icon" src="@/assets/images/common/logo-tiktok-hover.png"/>
              </a>
              <!--
              <template v-for="(media,index) in mediaList" :key="index">
                <a v-if="media.url" class="media-item" :href="media.url" target="_blank">
                  <img v-if="media.verified" class="plat-icon" :src="'@/assets/images/common/logo-'+media.name+'-hover.png'"/>
                  <img v-else class="media-icon" :src="'@/assets/images/common/logo-'+media.name+'.png'"/>
                </a>
                <img v-else class="media-item media-icon" :src="'@/assets/images/common/logo-'+media.name+'.png'"/>
              </template>
              -->
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
          <div class="no-more" v-if="isEnd">
            <div class="no-results"  v-if="list[currentTab]['length'] == 0">
              <img src="@/assets/images/common/emoji-null.png"/>
              No data
            </div>
            <template v-else>No more</template>
          </div>
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

    <!-- suspend -->
    <suspend @postSuccess="postSuccess()" />

    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance,  } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import NftContract from "@/contract/NftContract";
  import FollowButton from "@/component/follow-button.vue";
  import PostItem from '@/component/post-item.vue';
  import CommentItemProfile from '@/component/comment-item-profile.vue';
  import About from '@/component/about.vue';
  import loginMask from "@/component/login-mask.vue";
  import suspend from "@/component/suspend.vue";

  export default {
    components: {
      FollowButton,
      PostItem,
      CommentItemProfile,
      About,
      loginMask,
      suspend
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
        mediaList:[
          {        
            name: 'Link',        
            url: "",        
            verified: false    
          },{        
            name: 'Twitter',        
            url: "",        
            verified: false    
          },{        
            name: 'Instagram',        
            url: "",        
            verified: false    
          },{        
            name: 'YouTube',        
            url: "",        
            verified: false    
          },{        
            name: 'TikTok',        
            url: "",        
            verified: false    
          }
        ],
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
        limit:5,
        isEnd:false,
        isLoading:false,
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
        //other
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
            if(res.data.media){
              const media = [];
              res.data.media.forEach(item=>{
                media[item.name] = {
                  url:item.url,
                  verified:item.verified
                }
              })
              state.mediaList.forEach(item=>{
                item.url = media[item.name] ? media[item.name]['url'] : "";
                item.verified = media[item.name] ? media[item.name]['verified'] : false;
              })
            }

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
        if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd){
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
          console.log(res,'---res--');
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
        showCommunityList,
        closeCommunityList,
        showNftList,
        closeNftList,
        changeNftTab,
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
        .bg{
          width:690px;
          height:240px;
          object-fit: cover;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
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
          .media-list{
            margin-top:20px;
            display:flex;
            .media-item{
              width:24px;
              margin-right:30px;
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
</style>
