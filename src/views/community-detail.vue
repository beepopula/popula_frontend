<template>
  <div class="main-box">
    <div class="bg-box">
      <img v-if="detail.cover" :src="$store.getters.getAwsImg(detail.cover)" @error.once="$event.target.src=detail.cover">
      <img v-else src="@/assets/images/community/bg.png">
      <div class="bg-mask"></div>
    </div>
    <!-- Community info  -->
    <div class="community-info" v-if="detail.data">
      <div class="info-box">
        <div class="info-left">
          <img v-if="detail.avatar"  class="avatar" :src="$store.getters.getAwsImg(detail.avatar)" @error.once="$event.target.src=detail.avatar">
          <img v-else  class="avatar" src="@/assets/images/test/community.png">
          <div class="info">
            <div class="name" ><span class="txt-wrap">{{detail.name}}</span><div class="edit-btn" v-if="detail.data.createUser.account_id == $store.getters.accountId" @click="showEditBasicinfoLayer"></div></div>
            <div class="creator">Created by 
              <el-popover placement="bottom-start"  trigger="hover" @show="showCreateUser=true" @hide="showCreateUser=false">
                <template #reference>
                  <span @click="redirectPage('/user-profile/'+detail.data.createUser.account_id,false)">@{{detail.data.createUser.name || detail.data.createUser.account_id}}</span>
                </template>
                <template v-if="showCreateUser">
                  <UserPopup :account="detail.data.createUser.account_id" @login="showLogin=true"/>
                </template>
              </el-popover>
            </div>
            <div class="total">
              <div class="total-item"><span>{{detail.data.membersCount}}</span>Members</div>
              <div class="total-item"><span>{{detail.data.postCount}}</span>Posts</div>
            </div>
          </div>
        </div>
        <div class="info-right">
          <div class="token-list" v-if="$route.params.id != $store.state.nearConfig.MAIN_CONTRACT && false">
            <img class="token-icon" src="@/assets/images/test/token_icon1.png"/>
            <img class="token-icon" src="@/assets/images/test/token_icon2.png"/>
            <img class="token-icon" src="@/assets/images/test/token_icon3.png"/>
          </div>
          <div class="button-border join-button" v-if="$route.params.id != $store.state.nearConfig.MAIN_CONTRACT && detail.data.createUser.account_id != $store.getters.accountId">
            <div class="button" @click="changeJoinCommunity()">
              <template v-if="detail.data.isJoin">  Joined </template>
              <template v-else>  Join </template>
            </div>
            <div class="fail-tip" v-if="showJoinFailReason">
              <div class="title">Failed</div>
              <div class="reason">reason reason reason</div>
              <div class="token-list">
                <div class="token-item" v-for="i in 3">
                  <div class="left-info">
                    <img class="token-icon" src="@/assets/images/test/token_icon1.png"/>
                    <div class="token-symbol">OCT</div>
                  </div>
                  <div class="right-check">
                    <div class="count">≥ 100</div>
                    <img class="check-status" src="@/assets/images/community/icon-right.png"/>
                  </div>
                </div>
              </div>
              <div class="mini-button-border confirm-button">
                <div class="mini-button">confirm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bio txt-wrap2">{{detail.info}}</div>
    </div>
    <!-- Tab  -->
    <div class="page">
      <div :class="['page-item',currentPage == 'post' ? 'active' : '']" @click="currentPage='post'">Posts</div>
      <div :class="['page-item',currentPage == 'detail' ? 'active' : '']" @click="currentPage='detail'">Overview</div>
    </div>

    <div class="main main-post" v-if="currentPage == 'post'">
      <!-- left -->
      <div class="left">
        <Post v-if="detail.data" :community="detail" @postSuccess="postSuccess()"/>
        <div class="filter-menu">
          <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
          <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">
            New
            <div class="unread-count" v-if="postCount.new">{{postCount.new}}</div>
          </div>
        </div>
        <div class="post-list">
          <template v-for="item in postList[currentTab]">
            <PostItem :item="item" :from="'community'" @changePostListStatus="changePostListStatus(item,$event)"/>
          </template>
        </div>

        <div class="no-more" v-if="isEnd">
          <div v-if="postList[currentTab]['length'] == 0" class="no-result">
            <img src="@/assets/images/common/emoji-null.png"/>
            No posts
          </div>
          <template v-else>No more posts</template>
        </div>

      </div>
      <!-- right -->
      <div class="right">
        <!-- Members -->
        <div class="members">
          <div class="members-title">
            <div class="font20">Members</div>
            <div class="more" @click="showMemberList()">
              More
              <img class="more-arrow" src="@/assets/images/common/icon-arrow-right.png">
            </div>
          </div>
          <div class="members-list">
            <template v-for="item in members">
              <div class="members-item" v-if="item" @click="redirectPage('/user-profile/'+item.account_id,false)">
                <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                <div class="info">
                  <div :class="['name','name-'+item.data.type]">
                    <span class="name-txt txt-wrap">{{item.name || item.account_id.split(".testnet")[0]}}</span>
                    <div class="user-flag co" v-if="item.data.type=='creator' || item.account_id==detail.data.createUser.account_id"></div>
                    <div class="user-flag mod" v-else-if="item.data.type=='mod'"></div>
                  </div>
                  <div class="account txt-wrap">{{item.account_id}}</div>
                </div>
                <!-- follow -->
                <div class="follow-button" v-if="item.account_id != $store.getters.accountId">
                  <FollowButton 
                    :isFollow="item.data.isFollow" 
                    :accountId="item.account_id" 
                    :background="'#000'"
                    :position="'right'"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
        <!-- About -->
        <About/>
      </div>
    </div>

    <div class="main mian-detail" v-if="currentPage == 'detail'">
      <!-- left -->
      <div class="left">
        <!-- Community Information-->
        <div class="title" style="justify-content:flex-start;">
          Community Information
          <div class="edit-btn" v-if="detail.data.createUser.account_id == $store.getters.accountId" @click="showEditContributorLayer"></div>
        </div>
        <div class="community-information">
          <div class="intro">{{detail.information}}</div>       
          <div class="media">
            <a class="media-item website" :href="detail.website" target="_blank">Website</a>
            <a class="media-item governance" :href="detail.governance" target="_blank">Blog</a>
            <a class="media-item twitter" :href="detail.twitter" target="_blank">Twitter</a>
            <a class="media-item discord" :href="detail.discord" target="_blank">Discord</a>
          </div>

          <!-- creator -->
          <!--
          <div class="creator-box" v-if="detail.data">
            <div class="mini-title">Creator</div>
            <el-popover placement="bottom-start"  trigger="hover" @show="showCreateUser2=true" @hide="showCreateUser2=false">
              <template #reference>
                <div class="user" @click="redirectPage('/user-profile/'+detail.data.createUser.account_id,false)">
                  <img v-if="detail.data.createUser.avatar" class="avatar" :src="$store.getters.getAwsImg(detail.data.createUser.avatar)" @error.once="$event.target.src=detail.data.createUser.avatar">
                  <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                  <div class="user-info">
                    <div class="name">{{detail.data.createUser.name || detail.data.createUser.account_id}}</div>
                    <div class="account">{{detail.data.createUser.account_id}}</div>
                  </div>
                </div>
              </template>
              <template v-if="showCreateUser2">
                <UserPopup :account="detail.data.createUser.account_id" @login="showLogin=true"/>
              </template>
            </el-popover>
          </div>
          -->

          <!-- creator -->
          <div class="contributor-box" v-if="contributors.length>0">
            <div class="mini-title">Contributor</div>
            <div class="contributor">
              <template v-for="(item,index) in contributors">
                <el-popover placement="bottom-start"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                  <template #reference>
                    <div :class="['user','contributor-item',index%4 == 3 ? 'mr0' : '']">
                      <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                      <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                      <div class="user-info">
                        <div class="name txt-wrap">{{item.name || item.accountId}}</div>
                        <div class="account txt-wrap">{{item.accountId}}</div>
                      </div>
                    </div>
                  </template>
                  <template v-if="item.showUser">
                    <UserPopup :account="item.account_id" @login="showLogin=true"/>
                  </template>
                </el-popover>
              </template>
            </div>
          </div>
          
        </div>
        <!-- Benefits -->
        <template v-if="benefits.length>0 || detail.data.createUser.account_id == $store.getters.accountId">
          <div class="title" style="justify-content:flex-start;">
            Benefits
            <div class="edit-btn" v-if="detail.data.createUser.account_id == $store.getters.accountId" @click="showEditBenefitsLayer"></div>
          </div>
          <div class="benefits">
            <template v-for="(benefit,index) in benefits">
              <div :class="['benefit-item',index%2==1 ? 'mr0' : '']">
                <div class="mini-title txt-wrap">{{benefit.title}}</div>
                <div class="benefit-intro">
                  {{benefit.introduction}}
                </div>
                <div class="benefit-bottom">
                  <div class="benefit-type">{{benefit.type}}</div>
                  <!--<div class="benefit-points">100 points</div>-->
                </div>
              </div>
            </template>
          </div>
        </template>
        <!-- News -->
        <template v-if="news.length>0 || detail.data.createUser.account_id == $store.getters.accountId">
          <div class="title" style="justify-content:flex-start;">
            News
            <div class="edit-btn" v-if="detail.data.createUser.account_id == $store.getters.accountId" @click="showEditNewsLayer"></div>
          </div>
          <div class="news">
            <template  v-for="(item,index) in news">
              <div v-if="item.picture" class="news-item news-item-cover">
                <img class="news-left-cover" :src="$store.getters.getAwsImg(item.picture)" @error.once="$event.target.src=item.picture"/>
                <div class="news-right">
                  <div class="mini-title txt-wrap">{{item.title}}</div>
                  <div class="news-intro news-right-intro">{{item.introduction}}</div>
                  <!--
                  <div class="news-bottom">
                    <div class="news-from">Mirror</div>
                    <div class="news-time">Jan 4 , 2022</div>
                  </div>
                  -->
                </div>
              </div>
              <div v-else class="news-item">
                <div class="news-right">
                  <div class="mini-title txt-wrap">{{item.title}}</div>
                  <div class="news-intro">{{item.introduction}}</div>
                  <!--
                  <div class="news-bottom">
                    <div class="news-from">Mirror</div>
                    <div class="news-time">Jan 4 , 2022</div>
                  </div>
                  -->
                </div>
              </div>
            </template>
          </div>
        </template>

      </div>
      <!-- right -->
      <div class="right">
        <!-- Points Amount-->
        <template v-if="$route.params.id == 't3.community-genesis2.bhc8521.testnet'">
          <div class="title">Points Amount</div>
          <div class="points-amount">
            <img style="width:100%" src="@/assets/images/community/coming-soon.png"/>
          </div>
        </template>
        
        
        <!--
        <div class="points-amount" v-if="$route.params.id == 't3.community-genesis2.bhc8521.testnet'">
          <div class="points-amount-number">42,698,569</div>
          <div class="points-amount-ratio">
            <div class="points-amount-ratio-item"><span>+8.2%</span>24H</div>
            <div class="points-amount-ratio-item past-week"><span class="red">-17.3%</span>24H</div>
          </div>
          <div class="points-amount-charts">
            <img src="@/assets/images/test/data.png"/>
          </div>
          <div class="points-amount-report">
            <div class="points-amount-report-item">
              <div class="points-amount-report-number">90,399,165</div>
              <div class="points-amount-report-type">Total Minted</div>
            </div>
            <div class="points-amount-report-item mr0">
              <div class="points-amount-report-number">4,756</div>
              <div class="points-amount-report-type">Total Burned</div>
            </div>
            <div class="points-amount-report-item">
              <div class="points-amount-report-number">153,790</div>
              <div class="points-amount-report-type">7D Total</div>
            </div>
            <div class="points-amount-report-item mr0">
              <div class="points-amount-report-number">962,980</div>
              <div class="points-amount-report-type">7D Burned</div>
            </div>
          </div>
          <div class="points-amount-contract">
            <div>Contract</div>
            <div class="contract-hash">Bo8…gjljioShjklj</div>
          </div>
        </div>
        -->
        
        <!-- Members rank-->
        <!--
        <div class="title">
          <div class="font20">Members rank</div>
          <div class="more" @click="">More</div>
        </div>
        <div class="members-rank">
          <div class="members-rank-tab">
            <div class="members-rank-tab-item active">Usable</div>
            <div class="members-rank-tab-item">Total</div>
          </div>
          <template v-for="item in 7">
            <div class="members-rank-item">
              <div class="members-rank-item-left">
                <img v-if="item.avatar" class="avatar" :src="$store.getters.getAwsImg(item.avatar)" @error.once="$event.target.src=item.avatar">
                <img v-else class="avatar" src="@/assets/images/common/user-default.png">
                <div class="name txt-wrap">VValkerVValkerVValkerVValker</div>
              </div>
              <div class="members-rank-item-right">
                <div class="amount">126,367,268</div>
                <div class="ratio">+25.2%</div>
              </div>
            </div>
          </template>
        </div>
        -->
        <!-- About -->
        <About/>
      </div>
    </div>
  </div>

  <!-- left-menu -->
  <div class="left-menu" v-if="$store.getters.isLogin">
    <div class="navigation">
      <el-popover
        popper-class="community-pop"
        placement="bottom-start"
        trigger="hover"
        >
        <template #reference>
          <img class="icon" @click="redirectPage('/communities')" src="@/assets/images/community/navigation.png"/>
        </template>
        <div class="pop-box pop-tip">All Communities</div>
      </el-popover>
    </div>
    <div class="joined-communities" v-if="joinedList.length>0">
      <draggable 
        v-model="joinedList" 
        group="people" 
        @start="drag=true" 
        @end="dragEnd" 
        item-key="id">
        <template #item="{element}">
          <div :class="['joined-item',element.communityId==$route.params.id ? 'active' : '']">
            <el-popover
              popper-class="community-pop"
              placement="bottom-start"
              trigger="hover"
              >
              <template #reference>
                <img v-if="element.avatar" :src="$store.getters.getAwsImg(element.avatar)" @error.once="$event.target.src=element.avatar" @click="redirectPage('/community-detail/'+element.communityId)">
                <img v-else src="@/assets/images/test/community.png" @click="redirectPage('/community-detail/'+element.communityId)">
              </template>
              <div class="pop-box pop-tip" v-if="!drag">{{element.name}}</div>
            </el-popover>
          </div>
        </template>
      </draggable>
    </div>
  </div>

  <!-- members layer -->
  <div class="elastic-layer" v-if="showMembers" @click.self="closeMemberList()">
    <div class="edit-button close" @click="closeMemberList()"></div>
    <div class="layer-content">
      <div ref="memberLayer" class="all-members" @scroll="membersScroll()">
        <div class="title">Members({{memberCount}})</div>
        <div id="all-members-list" class="all-members-list" >
          <template v-for="item in memberList">
            <UserItem :item="item" :from="'memberList'"/>
          </template>
        </div>
        <div class="no-more" v-if="isEndMember">
          <template v-if="memberCount==0">No members</template>
          <template v-else>No more members</template>
        </div>
      </div>
    </div>
  </div>

  <!-- suspend -->
  <div class="suspend">
    <div id="backTop" class="back-top" @click="backTop()"></div>
    <div class="button-box" @click="popUp()">
      <div class="button">
        <img src="@/assets/images/post/icon-post.png"/>
      </div>
    </div>
    <div class="elastic-layer suspend-elastic-layer" v-if="showLayer" @click.self="closeSuspendLayer()">
      <div class="edit-button close" @click="closeSuspendLayer()"></div>
      <div class="elastic-layer-content">
        <Post v-if="detail.data" :community="detail" :location="'suspend'" @postSuccess="postSuccess()"/>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>

  <!-- suspend -->
  <!-- <suspend @postSuccess="postSuccess()" /> -->

  <!-- CommunityEditBasicinfo -->
  <template v-if="showEditBasicinfo">
    <CommunityEditBasicinfo :communityId="$route.params.id" :editInfo="editBasicinfo" @updateInfo="updateBasicinfo" @closeEditLayer="showEditBasicinfo=false"/>
  </template>
  <template v-if="showEditContributor">
    <CommunityEditContributor :communityId="$route.params.id" :editInfo="editContributor" @updateInfo="updateContributor" @closeEditLayer="showEditContributor=false"/>
  </template>
  <template v-if="showEditBenefits">
    <CommunityEditBenefits :communityId="$route.params.id" :editInfo="benefits" @updateInfo="updateBenefits" @closeEditLayer="showEditBenefits=false"/>
  </template>
  <template v-if="showEditNews">
    <CommunityEditNews :communityId="$route.params.id" :editInfo="news" @updateInfo="updateNews" @closeEditLayer="showEditNews=false"/>
  </template>


</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance } from "vue";
  import { useRoute,useRouter } from "vue-router";
  import { useStore } from 'vuex';
  import CommunityContract from "@/contract/CommunityContract";
  import { checkReceiptsSuccess, getGas} from '../utils/util';
  import { executeMultipleTransactions, generateAccessKey } from '@/utils/transaction';
  import Post from '@/component/post.vue';
  import PostItem from '@/component/post-item.vue';
  import About from '@/component/about.vue';
  import UserItem from '@/component/user-item.vue';
  import LoginMask from "@/component/login-mask.vue";
  import FollowButton from "@/component/follow-button.vue";
  import UserPopup from '@/component/user-popup.vue';
  import suspend from "@/component/suspend.vue";
  import CommunityEditBasicinfo from "@/component/community-edit-basicinfo.vue";
  import CommunityEditContributor from "@/component/community-edit-contributor.vue";
  import CommunityEditBenefits from "@/component/community-edit-benefits.vue";
  import CommunityEditNews from "@/component/community-edit-news.vue";
  import draggable from 'vuedraggable'
  export default {
    components: {
      Post,
      PostItem,
      About,
      UserItem,
      LoginMask,
      FollowButton,
      UserPopup,
      suspend,
      CommunityEditBasicinfo,
      CommunityEditContributor,
      CommunityEditBenefits,
      CommunityEditNews,
      draggable,
    },
    setup(){
      const store = useStore();
      const route = useRoute();
      const router = useRouter();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        detail:{},
        //joinedList
        showJoinFailReason:false,
        joinedList:[],
        //postList
        currentTab:"",
        postList:{
          hot:[],
          new:[],
        },
        postCount:{
          hot:0,
          new:0,
        },
        page:0,
        limit:10,
        isEnd:false,
        isLoading:false,
        //members
        memberCount:0,
        members:[],
        memberList:[],
        showMembers:false,
        pageMember:0,
        limitMember:10,
        isEndMember:false,
        isLoadingMember:false,
        //other
        currentPage:"post",
        showLogin:false,
        showLayer:false,
        drag: false,
        showCreateUser:false,
        showCreateUser2:false,
        //
        contributors:[],
        benefits:[],
        news:[],
        //edit
        showEditBasicinfo:false,
        editBasicinfo:{},
        showEditContributor:false,
        editContributor:{},
        showEditBenefits:false,
        showEditNews:false,
      })

      const init = async () => {
        const res = await proxy.$axios.community.get_community_detail({
          accountId:store.getters.accountId || "",
          communityId:route.params.id,
        });
        if(res.success) {
          state.detail = res.data;
          state.contributors = state.detail.contributor ||  [];
        }
        //posts
        changeTab('hot');
        //joinedCommunity
        if(store.getters.isLogin){
          const res = await proxy.$axios.community.get_joined_community_list({
            accountId:store.getters.accountId,
            page:0,
            limit:10000
          });
          if(res.success) {
            state.joinedList = res.data;
          }
        }
        //Members
        state.members = (await getMembers()).slice(0,3);
        //postCommunity
        initUnreadCount();
        //initBenefitAndNews
        initBenefits();
        initNews();
      };

      const initBenefits = async () => {
        const res = await proxy.$axios.community.get_benefit_list({
          communityId:route.params.id,
          accountId:store.getters.accountId || '',
        });
        if(res.success) {
          state.benefits = res.data;
        }
      }
      const initNews = async () => {
        const res = await proxy.$axios.community.get_news_list({
          communityId:route.params.id,
          accountId:store.getters.accountId || '',
        });
        if(res.success) {
          state.news = res.data;
        }
      }

      //unread post count
      const initUnreadCount = async () => {
        let lastPostId = '';
        let commLastPostId = localStorage.getItem("commLastPostId") || '{}';
        commLastPostId = JSON.parse(commLastPostId);
        
        if(commLastPostId[route.params.id]){
          lastPostId = commLastPostId[route.params.id];
        }else if(localStorage.getItem("lastPostId")){
          lastPostId = localStorage.getItem("lastPostId")
        }
        const resNew = await proxy.$axios.post.get_post_list({
          type: 'new',
          page:0,
          limit:10,
          communityId:route.params.id,
          lastPostId:lastPostId,
        });
        if(lastPostId){
          state.postCount['new'] = resNew.unReadCount;
        }
        if(resNew.data && resNew.data.length>0){
          commLastPostId[route.params.id] = resNew['data'][0]['target_hash'];
          localStorage.setItem("commLastPostId",JSON.stringify(commLastPostId));
        }
        
      }

      //changeJoinCommunity
      const changeJoinCommunity = async () => {
        if(!store.getters.isLogin){
          state.showLogin = true
        }else{
          try{
            const method = state.detail.data.isJoin ? 'quit' : 'join';
            const taskTransaction = {
              receiverId: route.params.id,
              actions: [{
                kind: "functionCall",
                methodName: method,
                args: {},
                deposit: "20000000000000000000000",
                gas: getGas().toString()
              }]
            }
            const accessKey = await generateAccessKey(store.getters.accountId, route.params.id)
            const accessKeyTransaction = {
              receiverId: store.getters.accountId,
              actions: [{
                kind: "addKey",
                publicKey: accessKey.publicKey,
                accessKey: accessKey.accessKey
              }]
            }
            const result = await executeMultipleTransactions(store.state.account, [taskTransaction, accessKeyTransaction]);
            // if (!checkReceiptsSuccess(result)) {
            //   return false
            // }
            // state.detail.data.isJoin = !state.detail.data.isJoin;
            if (result == true) {
              state.detail.data.isJoin = !state.detail.data.isJoin;
            } else  if (res == false) {
              throw new Error('error')
            } else {}
            
          }catch(e){
            const message = state.detail.data.isJoin ? 'Quit Failed' : 'Join Failed';
            proxy.$Message({
              message,
              type: "error",
            });
            console.log(message+" error:"+e);
          }
        }
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
          communityId:route.params.id,
          accountId:store.getters.isLogin ? store.getters.accountId : "",
        });
        state.isLoading = false;
        if(res.success){
          if(state.page==0 && state.currentTab=='new' && res.data.length>0){
            let commLastPostId = localStorage.getItem("commLastPostId") || '{}';
            commLastPostId = JSON.parse(commLastPostId);
            commLastPostId[route.params.id] = res['data'][0]['target_hash'];
            localStorage.setItem("commLastPostId",JSON.stringify(commLastPostId));
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
        if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoading && !state.isEnd && state.currentTab){
          const res = await getPosts();
          state.postList[state.currentTab] = state.postList[state.currentTab].concat(res.data);
        }
      }

      //getMembers
      const getMembers = async (isList) => {
        state.isLoadingMember = true;
        const res = await proxy.$axios.community.get_member_list({
          communityId: route.params.id,
          page:state.pageMember,
          limit:state.limitMember,
          accountId:store.getters.isLogin ? store.getters.accountId : ""
        });
        state.isLoadingMember = false;
        if(res.success){
          if(state.pageMember==0){
            state.memberCount = res.count;
          }
          if(isList){
            if(res.data.length==0){
              state.isEndMember = true;
            }
            state.pageMember += 1;
          }
          return res.data;
        }
        return [];
      }

      const showMemberList = async () => {
        document.getElementsByTagName('body')[0].classList.add("fixed");
        state.showMembers = true;
        state.memberList = [];
        state.pageMember = 0;
        state.isLoadingMember = false;
        state.memberList = await getMembers(true);
      }

      const closeMemberList = async () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.members = [];
        state.showMembers = false;
        const res = await proxy.$axios.community.get_member_list({
          communityId: route.params.id,
          page:0,
          limit:3,
          accountId:store.getters.isLogin ? store.getters.accountId : ""
        });
        state.members = res.data;
      }

      //membersScroll
      const memberLayer = ref();
      const membersScroll = async () => {
        const memberBox = memberLayer.value;
        if(((memberBox.scrollTop + window.innerHeight) >= memberBox.scrollHeight-200) && !state.isLoadingMember && !state.isEndMember){
          const res = await getMembers(true);
          state.memberList = state.memberList.concat(res);
        }
      }

      //edit Basicinfo
      const showEditBasicinfoLayer = () => {
        state.editBasicinfo = {
          name:state.detail.name,
          info:state.detail.info,
          avatar:state.detail.avatar,
          cover:state.detail.cover
        }
        state.showEditBasicinfo = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateBasicinfo = (info) => {
        state.detail.name = info.name;
        state.detail.info = info.info;
        state.detail.avatar = info.avatar;
        state.detail.cover = info.cover;
        
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditBasicinfo = false;
      }


      //edit Contributor
      const showEditContributorLayer = () => {
        state.editContributor = {
          information:state.detail.information,
          contributor:state.contributors || []
        }
        state.showEditContributor = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateContributor = (info) => {
        state.detail.information = info.information;
        state.contributor = info.contributor;

        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditContributor = false;
      }

      //edit Benefits
      const showEditBenefitsLayer = () => {
        state.showEditBenefits = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateBenefits = (info) => {
        state.benefits = info;
        state.showEditBenefits = false;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
      }

      //edit News
      const showEditNewsLayer = () => {
        state.showEditNews = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
      const updateNews = (info) => {
        state.news = info;
        
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showEditNews = false;
      }

      //drag
      const dragEnd = async (event) => {
        state.drag = false;

        const res = await proxy.$axios.community.replacement_sequence({
          communityId: state.joinedList[event.newIndex]['communityId'],
          upCommunityId: state.joinedList[event.newIndex-1] ? state.joinedList[event.newIndex-1]['communityId'] : '',
          downCommunityId: state.joinedList[event.newIndex+1] ? state.joinedList[event.newIndex+1]['communityId'] : '',
          accountId:store.getters.accountId,
        });

      }

      //changePostListStatus 
      const changePostListStatus = (item,close=false) => {
        state.postList[state.currentTab].forEach(i=>{
          if(i==item && !close){
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
          router.push({
            path
          });
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
      const closeSuspendLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        state.showLayer=false;
      }

      //postSuccess
      const postSuccess = () => {
        closeSuspendLayer();
        changeTab('new');
      }

      return {
        ...toRefs(state),
        init,
        changeJoinCommunity,
        showLoginMask,
        closeLoginMask,
        changeTab,
        handleScroll,
        showMemberList,
        closeMemberList,
        memberLayer,
        membersScroll,
        showEditBasicinfoLayer,
        updateBasicinfo,
        showEditContributorLayer,
        updateContributor,
        showEditBenefitsLayer,
        updateBenefits,
        showEditNewsLayer,
        updateNews,
        dragEnd,
        redirectPage,
        changePostListStatus,
        backTop,
        popUp,
        closeSuspendLayer,
        postSuccess
      }
    },
    mounted(){
      this.$router.push({query: {}})
      this.init();
      window.addEventListener('scroll',this.handleScroll);
    }
  }
</script>

<style lang="scss" scoped>
  .main-box{
    padding-top:220px;
    position:static;
    .bg-box{
      position: absolute;
      top:80px;
      left:0;
      width:100vw;
      height:300px;
      img{
        width:100vw;
        height:100%;
        object-fit: cover;
      }
      .bg-mask{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index: 2;
        background:url('@/assets/images/community/bg-mask.png') no-repeat center bottom;
        background-size:cover;
      }
    }
    .community-info{
      width: 1040px;
      background: #28282D;
      border-radius: 24px;
      padding:20px;
      position:relative;
      z-index:2;
      .info-box{
        display:flex;
        justify-content:space-between;
        align-items:center;
        height: 90px;
        .info-left{
          height: 90px;
          display:flex;
          .avatar{
            width: 90px;
            height: 90px;
            border-radius: 16px;
            object-fit: cover;
          }
          .info{
            height: 90px;
            display:flex;
            flex-direction: column;
            justify-content: center;
            margin-left:30px;
            .name{
              font-family: D-DINExp-Bold;
              font-size: 20px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              display:flex;
              align-items: center;
              line-height:22px;
              height:22px;
              span{
                max-width: 300px;
              }
            }
            .creator{
              margin-top:8px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
              span{
                color: #FFFFFF;
                cursor: pointer;
              }
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
                line-height:18px;
                span{
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 700;
                  margin-right:4px;
                }
              }
            }
          }
        }
        .info-right{
          height:90px;
          display:flex;
          align-items:center;
          .token-list{
            margin-right:30px;
            display:flex;
            align-items:center;
            .token-icon{
              margin-left:10px;
              width: 24px;
              height: 24px;
              border-radius:50%;
            }
          }
          .join-button{
            position: relative;
            .button{
              background:#28282D;
            }
            .fail-tip{
              position:absolute;
              top:50px;
              right:0;
              width: 320px;
              background: #000000;
              border: 1px solid rgba(255,255,255,0.2);
              box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
              border-radius: 10px;
              padding:30px;
              .title{
                font-family: D-DINExp-Bold;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 700;
              }
              .reason{
                margin-top:8px;
                opacity: 0.5;
                font-family: D-DINExp;
                font-size: 14px;
                color: #FFFFFF;
                letter-spacing: 0;
                text-align: justify;
                font-weight: 400;
              }
              .token-list{
                margin:10px 0;
                .token-item{
                  padding:20px 0;
                  display: flex;
                  justify-content:space-between;
                  border-top: 1px solid rgba(255,255,255,0.2);
                  &:first-child {
                    border:0;
                  }
                  .left-info{
                    display:flex;
                    align-items: center;
                    .token-icon{
                      width: 30px;
                      height: 30px;
                      border-radius:50%;
                    }
                    .token-symbol{
                      margin-left:12px;
                      font-family: D-DINExp-Bold;
                      font-size: 14px;
                      color: #FFFFFF;
                      letter-spacing: 0;
                      font-weight: 700;
                    }
                  }
                  .right-check{
                    display:flex;
                    align-items: center;
                    .count{
                      font-family: D-DINExp-Bold;
                      font-size: 16px;
                      color: rgba(255,255,255,0.5);
                      letter-spacing: 0;
                      font-weight: 700;
                    }
                    .check-status{
                      margin-left:20px;
                      width:16px;
                      height:16px;
                    }
                  }
                }
              }
              .confirm-button{
                margin:0 auto;
              }
            }
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
    }
    .page{
      margin-top:40px;
      display:flex;
      justify-content: center;
      .page-item{
        width: 200px;
        padding-bottom:14px;
        text-align: center;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        font-weight: 700;
        position:relative;
        cursor: pointer;
        &::after{
          position:absolute;
          bottom:0;
          left:0;
          display:block;
          content:"";
          width: 100%;
          height: 2px;
          background: #28282D;
          border-radius: 2px;
        }
        &.active{
          &::after{
            background: #FED23C;
            border-radius: 2px;
          }
        }
      }
    }
    .main {
      margin-top:30px;
      .left{
        padding-right:20px;
      }
    }
  }

  .main-post{
    .left{
      .post-list{
        background: #28282D;
        border-radius: 24px;
        padding:0 20px;
        margin-top:20px;
      }
    }
    .right{
      .members{
        width: 320px;
        height: auto;
        background: #000000;
        border-radius: 20px;
        margin-bottom:20px;
        padding:20px 20px 30px;
        .members-title{
          display:flex;
          justify-content:space-between;
          align-items: end;
          .more{
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: right;
            font-weight: 400;
            cursor: pointer;
            display:flex;
            align-items:center;
            .more-arrow{
              width:14px;
              height:14px;
            }
          }
        }
        .members-list{
          .members-item{
            margin-top:30px;
            display:flex;
            position:relative;
            align-items: center;
            cursor:pointer;
            .avatar{
              width: 40px;
              height: 40px;
              border-radius:50%;
              object-fit: cover;
            }
            .info{
              margin-left:12px;
              .name{
                height:20px;
                display: flex;
                align-items: center;
                &.name-creator{
                  .name-txt{
                    max-width:76px;
                  }
                }
                &.name-mod{
                  .name-txt{
                    max-width:68px;
                  }
                }
                .name-txt{
                  display:inline-block;
                  max-width:100px;
                  line-height: 20px;
                  font-family: D-DINExp-Bold;
                  font-size: 18px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 700;
                }
                .user-flag{
                  margin-left:4px;
                  width: 20px;
                  height: 14px;
                  &.co{
                    background:url("@/assets/images/common/co.png") no-repeat right center;
                    background-size:20px 14px;
                  }
                  &.mod{
                    width: 28px;
                    background:url("@/assets/images/common/mod.png") no-repeat right center;
                    background-size:28px 14px;
                  }
                }
              }
              .account{
                width:100px;
                line-height: 16px;
                opacity: 0.5;
                font-family: D-DINExp;
                font-size: 14px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
            }
            .follow-button{
              position:absolute;
              top:0;
              right:0;
            }
          }
        }
      }
    }
  }

  .mian-detail{
    .title{
      display: flex;
      align-items: center;
      justify-content:space-between;
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      height:22px;
      line-height:22px;
      margin-bottom:20px;
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
    .mini-title{
      font-family: D-DINExp-Bold;
      font-size: 18px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      line-height:20px;
    }
    .left{
      .community-information{
        width:690px;
        background: #28282D;
        border-radius: 24px;
        padding:20px;
        margin-bottom:60px;
        .intro{
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: justify;
          line-height: 26px;
          font-weight: 400;
        }
        .media{
          margin-top:20px;
          display:flex;
          align-items: center;
          .media-item{
            padding-left:27px;
            margin-right:40px;
            font-family: D-DINExp;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
            letter-spacing: 0;
            text-align: justify;
            font-weight: 400;
            cursor: pointer;
            &:hover{
              color: rgba(255,255,255,1);
            }
            &.website{
              background:url('@/assets/images/common/logo-link-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-link.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            &.governance{
              background:url('@/assets/images/common/logo-governance-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-governance.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            &.twitter{
              background:url('@/assets/images/common/logo-twitter-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-twitter.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
            &.discord{
              background:url('@/assets/images/common/logo-discord-hover.png') no-repeat left center;
              background-size:auto 16px;
              &:hover{
                background:url('@/assets/images/common/logo-discord.png') no-repeat left center;
                background-size:auto 16px;
              }
            }
          }
        }
        .user{
          display:flex;
          align-items: center;
          cursor: pointer;
          margin-bottom:27px;
          .avatar{
            width:40px;
            height:40px;
            border-radius:50%;
            object-fit: cover;
          }
          .user-info{
            margin-left:12px;
            .name{
              font-family: D-DINExp-Bold;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .account{
              margin-top:4px;
              opacity: 0.5;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
            }
          }
        }
        .creator-box{
          border-top:1px solid rgba(255,255,255,0.1);
          padding:30px 0 0;
          margin-bottom:10px;
          .user{
            margin-top:20px;
          }
        }
        .contributor-box{
          border-top:1px solid rgba(255,255,255,0.1);
          padding-top:30px;
          margin-top:30px;
          margin-bottom:10px;
          .contributor{
            display:flex;
            flex-wrap:wrap;
            .contributor-item{
              margin-right:40px;
              margin-top:20px;
              margin-bottom:0;
              &.mr0{
                margin-right:0;
              }
              .user-info{
                width:80px;
              }
            }
          }
        }
      }
      .benefits{
        display:flex;
        flex-wrap:wrap;
        margin-bottom:40px;
        .benefit-item{
          width:335px;
          height:161px;
          padding:20px;
          background: #28282D;
          border-radius: 24px;
          margin-bottom:20px;
          margin-right:20px;
          &.mr0{
            margin-right:0;
          }
          .benefit-intro{
            height:48px;
            margin-top:10px;
            opacity: 0.7;
            font-family: D-DINExp;
            font-size: 16px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 24px;
            font-weight: 400;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-wrap:break-word;
          }
          .benefit-bottom{
            margin-top:20px;
            height:24px;
            display:flex;
            align-items: center;
            .benefit-type{
              padding:0 10px;
              height:24px;
              background: #36363C;
              border-radius: 12px;    
              display:flex;
              align-items: center;
              justify-content:center;
              font-family: D-DINExp;
              font-size: 12px;
              line-height:24px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 400;
            }
            .benefit-points{
              margin-left:30px;
              padding-left:20px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              background:url('@/assets/images/common/icon-coin.png') no-repeat left center;
              background-size:auto 16px;
            }
          }
        }
      }
      .news{
        .news-item{
          margin-top:20px;
          width:690px;
          padding:20px;
          background: #28282D;
          border-radius: 24px;
          display:flex;
          &.news-item-cover{
            .news-right{
              width:350px;
            }
          }
          .news-left-cover{
            width:180px;
            height:180px;
            border-radius: 10px;
            margin-right:20px;
            object-fit: cover;
          }
          .news-right{
            width:650px;
            flex:1;
            .mini-title{
              width:100%;
            }
            .news-intro{
              margin-top:10px;
              opacity: 0.7;
              font-family: D-DINExp;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              line-height: 24px;
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 5;
              -webkit-box-orient: vertical;
              word-wrap:break-word;
              &.news-right-intro{
                height:114px;
              }
            }
            .news-bottom{
              margin-top:20px;
              display:flex;
              align-items: center;
              height:16px;
              font-family: D-DINExp;
              font-size: 14px;
              color: rgba(255,255,255,0.5);
              letter-spacing: 0;
              font-weight: 400;
              .news-time{
                margin-left:30px;
              }
            }
          }
          
        }
      }
    }
    .right{
      .points-amount{
        margin-bottom:20px;
        width:320px;
        padding:20px;
        background: #000000;
        border-radius: 20px;
        .points-amount-number{
          font-family: D-DINExp-Bold;
          font-size: 28px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height:30px;
        }
        .points-amount-ratio{
          margin-top:20px;
          height:18px;
          display:flex;
          align-items: center;
          .points-amount-ratio-item{
            display:flex;
            align-items: center;
            height:18px;
            line-height:18px;
            font-family: D-DINExp;
            font-size: 14px;
            color:rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            &.past-week{
              margin-left:30px;
            }
            span{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #7FD576;
              font-weight: 700;
              line-height:18px;
              margin-right:4px;
              &.red{
                color: #FF6868;
              }
            }
          }
          
        }
        .points-amount-charts{
          margin: 40px 0 10px;
          >img{
            display:block;
            width:100%;
          }
        }
        .points-amount-report{
          display:flex;
          flex-wrap: wrap;
          .points-amount-report-item{
            margin-top:30px;
            margin-right:20px;
            width:130px;
            &.mr0{
              margin-right:0;
            }
            .points-amount-report-number{
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:18px;
            }
            .points-amount-report-type{
              margin-top:4px;
              opacity: 0.5;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              line-height:16px;
            }
          }
        }
        .points-amount-contract{
          margin-top:30px;
          display:flex;
          justify-content:space-between;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0;
          font-weight: 400;
          line-height:16px;
          .contract-hash{
            text-align:right;
            width:162px;
            padding-right:26px;
            background:url("@/assets/images/common/icon-jump.png") no-repeat right center;
            background-size:16px 16px;
          }
        }
      }
      .members-rank{
        margin-bottom:20px;
        width:320px;
        padding:20px;
        background: #000000;
        border-radius: 20px;
        .members-rank-tab{
          display:flex;
          height:18px;
          padding-bottom:14px;
          .members-rank-tab-item{
            margin-right:30px;
            font-family: D-DINExp;
            font-size: 16px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            height:18px;
            line-height:18px;
            position:relative;
            &.active{
              font-family: D-DINExp-Bold;
              color: #FFFFFF;
              font-weight: 700;
              &::after{
                position: absolute;
                bottom:-8px;
                left:50%;
                transform: translateX(-50%);
                display:block;
                content:'';
                width:16px;
                height:2px;
                background: #FED23C;
                border-radius: 2px;
              }
            }
          }
        }
        .members-rank-item{
          margin-top:24px;
          display:flex;
          align-items: center;
          justify-content:space-between;
          .members-rank-item-left{
            display:flex;
            align-items: center;
            .avatar{
              width:30px;
              height:30px;
              border-radius:50%;
              object-fit: cover;
            }
            .name{
              margin-left:12px;
              width:80px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
            }
          }
          .members-rank-item-right{
            display:flex;
            align-items: center;
            .amount{
              margin-right:10px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
            }
            .ratio{
              font-family: D-DINExp;
              font-size: 14px;
              color: #7FD576;
              letter-spacing: 0;
              font-weight: 400;
            }
          }
        }
      }
    }
  }

  .left-menu{
    position:fixed;
    top:50%;
    left:30px;
    transform: translateY(-50%);
    z-index:99;
    width: 110px;
    background: #28282D;
    border-radius: 24px;
    padding:30px 4px;
    text-align:center;
    .navigation{
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.1);
      display:flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      margin:0 auto;
      cursor:pointer;
      .icon{
        width:24px;
        transform:rotate(-90deg);
      }
    }
    .joined-communities{
      margin-top:30px;
      max-height:400px;
      overflow-y:auto;
      .joined-item{
        position:relative;
        left:3px;
        width: 50px;
        height: 50px;
        border-radius:8px;
        margin:0 auto 30px;
        cursor:pointer;
        position: relative;
        overflow:visible;
        &:last-child{
          margin-bottom:0;
        }
        &.active{
          &::before{
            position:absolute;
            left:-26px;
            top:5px;
            display:block;
            content:"";
            width:4px;
            height:40px;
            background:url("@/assets/images/community/selected.png") no-repeat;
            background-size: 4px 40px;
          }
        }
        img{
          width: 50px;
          height: 50px;
          border-radius:8px;
          object-fit: cover;
        }
      }
    }
  }

  .all-members{
    width:706px;
    margin:0 auto;
    .title{
      line-height:26px;
      font-family: D-DINExp-Bold;
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
    }
    .all-members-list{
      background: #28282D;
      border-radius: 24px;
      padding:0 20px;
      margin-top:20px;
    }
  }

  .edit-btn{
    width:16px;
    height:16px;
    cursor:pointer;
    background:url("@/assets/images/common/icon-edit.png") no-repeat center center;
    background-size:16px 16px;
    margin-left:12px;
  }

</style>

<style lang="scss">

</style>
