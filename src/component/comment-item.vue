<template>
  <div class="comment-item-box" v-if="!isBlocked && !hasDelete">
    <div :class="['comment-item',from=='elastic-layer' ? 'layer-comment-item' : '']" @click="showCommentLayer()">
      <!-- user -->
      <div class="user" v-if="$props.item.data">
        <!-- avatar -->
        <el-popover placement="bottom" :fallback-placements="[ 'top']"  trigger="hover" @show="showUser=true" @hide="showUser=false">
          <template #reference>
            <div @click.stop="redirectPage('/user-profile/'+item.accountId,false)">
              <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
              <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
            </div>
         </template>
          <template v-if="showUser">
            <UserPopup :account="item.accountId" @login="showLogin=true"/>
          </template>
        </el-popover>

        <!-- userinfo -->
        <div class="user-info">
          <div class="name" @click.stop="redirectPage('/user-profile/'+item.accountId,false)">
            <div class="name-txt txt-wrap">{{item.accountId}}</div>
            <!-- CO -->
            <template v-if="$props.community.accountId == item.accountId">
              <el-popover
                placement="bottom-start"
                trigger="hover"
                >
                <template #reference>
                  <div class="user-flag co"></div>
                </template>
                <div class="pop-box pop-tip pop-user-flag">Community Originator</div>
              </el-popover>
            </template>
            <!-- PO -->
            <template v-if="$props.post.accountId == item.accountId">
              <el-popover
                placement="bottom-start"
                trigger="hover"
                >
                <template #reference>
                  <div class="user-flag op"></div>
                </template>
                <div class="pop-box pop-tip pop-user-flag">Original Poster</div>
              </el-popover>
            </template>
          </div>
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="createtime">{{time.showTime}}</div>
            </template>
            <div class="pop-box pop-tip">{{time.hoverTime}}</div>
          </el-popover>
        </div>

        <!-- edit -->
        <el-popover placement="bottom"  trigger="hover" popper-class="edit-popper">
          <template #reference>
            <img class="icon icon-edit" src="@/assets/images/post-item/icon-more.png"/>
          </template>
          <div class="pop-box pop-edit">
            <!-- self -->
            <template v-if="user.account_id == $store.getters.accountId">
              <div class="pop-edit-item" @click.stop="del()">
                <img class="icon16" src="@/assets/images/post-item/icon-delete.png"/>
                Delete
              </div>
            </template>
            <!-- other people -->
            <template v-else>
              <div class="pop-edit-item" @click.stop="report()">
                <img class="icon16" src="@/assets/images/post-item/icon-report.png"/>
                Report
              </div>
              <div class="pop-edit-item" @click.stop="block()">
                <img class="icon16" src="@/assets/images/post-item/icon-block.png"/>
                Block
              </div>
            </template>
          </div>
        </el-popover>
      </div>

      <!-- reply user  -->
      <div class="reply-user" v-if="item.data.replay">
        Replying to 
        <el-popover placement="bottom-start"  trigger="hover" @show="showReplyUser=true" @hide="showReplyUser=false">
          <template #reference>
            <span @click.stop="redirectPage('/user-profile/'+item.data.replay,false)">@{{item.data.replay}}</span>
          </template>
          <template v-if="showReplyUser">
            <UserPopup :account="item.data.replay" @login="showLogin=true"/>
          </template>
        </el-popover>
      </div> 
      

      <!-- text -->
      <div class="text text-ellipsis-wrapper" @click.stop="showCommentLayer()">
        <div ref="textBox" :class="['txt','txt-wrap5',needWrap ? '' : 'hidebtn', showall? 'showall' : '']" :style="textStyleObject">
          <!--<pre>{{text}}</pre>-->
          <label class="btn" @click.stop="showall = !showall"></label>
          <pre ref="textDom"><div v-html="text" @click.stop="textJump"></div></pre>
        </div>
      </div>
      
      <!-- info-bottom -->
      <div class="info-bottom">
        <div class="info-left">
          <!-- status-landlord -->
          <div class="status" v-if="commentCount>0">replyed</div>
          <!-- gas -->
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="gas">{{gasUsed}}</div>
            </template>
            <div class="pop-box pop-intro">
              <div class="title">Gas fee</div>
              <div class="intro">Total Gas Fee occurred on this post, signalling the extent of popularity.</div>
            </div>
          </el-popover>
          <!-- hash -->
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <a class="hash" :href="$store.state.nearConfig.explorerUrl+'/transactions/'+item.transaction_hash" target="_blank">Tx</a>
            </template>
            <div class="pop-box pop-intro pop-hash">
              <div class="hash-txt">
                <a class="txt-wrap" :href="$store.state.nearConfig.explorerUrl+'/transactions/'+item.transaction_hash" target="_blank">{{item.transaction_hash}}</a>
                <img class="icon-copy" @click.stop="triggerCopy(item.transaction_hash)" src="@/assets/images/common/icon-copy.png">
              </div>
            </div>
          </el-popover>
        </div>
        <div class="info-right">
          <!-- share -->
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="share">{{shareCount}}</div>
            </template>
            <div class="pop-box pop-edit">
              <div class="pop-edit-item" @click.stop="shareTwitter()">
                <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
                Twitter
              </div>
              <div class="pop-edit-item" @click.stop="triggerCopy(post.target_hash,true)">
                <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
                Copy link
              </div>
            </div>
          </el-popover>
          <!-- reply -->
          <div :class="['comment',addCount ? 'add-count' : '']" @click.stop="reply()">
            <template v-if="commentCount>0">{{commentCount}}</template>
            <template v-else>Reply</template>
          </div>
          <!-- like -->
          <Like :item="like" :type="'comment'" @changeLike="changeLike"/>
        </div>
      </div>

      <!-- comment -->
      <div class="comment-box" v-if="from!='elastic-layer-parent' && $props.item.isComment">
        <Comment 
          :targetHash="item.target_hash" 
          :parentAccount="item.accountId"
          :hierarchies="item.hierarchies"
          :communityId="item.receiverId" 
          :postType="post.type" 
          :from="'list'"
          :focus="focusComment"
          @comment="comment"
        />
        ...
      </div>
    </div>

    <!-- Comment List -->
    <div class="elastic-layer" v-if="showCommentList" @click.self="closeLayer()">
      <div class="edit-button back" v-if="hasBack"  @click="showCommentList=false">{{hasBack}}</div>
      <div class="edit-button close" @click="closeLayer()"></div>
      <div class="layer-content" ref="commentLayer" @scroll="commentsScroll()" @click.self="closeLayer()">
        <div class="child-comments-box">
          <div class="parent-comment">
            <CommentItem 
              :community="$props.community"
              :post="post" 
              :item="detail" 
              :commentC="commentCount" 
              :from="'elastic-layer-parent'"
              :level="$props.level+1"
            />
          </div>
          <Comment 
            :targetHash="item.target_hash" 
            :parentAccount="item.accountId"
            :hierarchies="item.hierarchies"
            :communityId="item.receiverId" 
            :postType="post.type" 
            @comment="commentRefresh"
          />
          <div class="all-comments-title">
            <div class="font20">Comments({{commentCount}})</div>
            <div class="filter-menu">
              <div :class="['filter-menu-item',currentTab == 'hot' ? 'active' : '']" @click="changeTab('hot')">Hot</div>
              <div :class="['filter-menu-item',currentTab == 'new' ? 'active' : '']" @click="changeTab('new')">New</div>
            </div>
          </div>
          <div class="child-comments">
            <template v-for="item in commentList[currentTab]">
              <CommentItem 
              :community="$props.community" 
              :level="$props.level+1" 
              :post="post" 
              :item="item" 
              from="elastic-layer" 
              :hasBack="true" 
              @closeLayer="closeLayer"
              @changeCommentListStatus="changeCommentListStatus(item,$event)" />
            </template>
          </div>
          <div class="no-more" v-if="isEnd">
            <div v-if="commentCount == 0" class="no-result">
              <img src="@/assets/images/common/emoji-null.png"/>
              No comments
            </div>
            <template v-else>No more comments</template>
          </div>
        </div>
      </div>
    </div>

    <!-- #copy_text  display:none;  -->
    <div :data-clipboard-text="copyText" ref="copy_text"  :id="'copy_text'+item.target_hash" @click="handleCopyFun"></div>

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>


    <!-- ConfirmModal -->
    <template v-if="showReportModal">
      <ConfirmModal :title="'Report'" :intro="'I think this comments has offended me.'" @cancel="showReportModal=false" @confirm="reportConfirm"/>
    </template>
    <template v-if="showDeleteModal">
      <ConfirmModal :title="'Delete'" :intro="'This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.'" @cancel="showDeleteModal=false" @confirm="deleteConfirm"/>
    </template>
    <template v-if="showBlockModal">
      <ConfirmModal :title="'Block'" :intro="'This will hide this comments from your posts as well as hide them from your view on your explore and other threads.'" @cancel="showBlockModal=false" @confirm="blockConfirm"/>
    </template>
  </div>
</template>

<script>
import { ref, reactive, toRefs , watch, nextTick, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import CommunityContract from "@/contract/CommunityContract";
import { formatAmount, checkCondition, getTimer} from "@/utils/util.js";
import Clipboard from 'clipboard';
import Comment from '@/component/comment.vue';
import UserPopup from '@/component/user-popup.vue';
import Like from "@/component/like.vue";
import LoginMask from "@/component/login-mask.vue";
import ConfirmModal from '@/component/confirm-modal.vue';
import * as bs58 from 'bs58';
export default {
  components: {
    Comment,
    UserPopup,
    Like,
    LoginMask,
    ConfirmModal
  },
  props:{
    from:{
      type:String,
      value:""
    },
    community:{
      type:Object,
      value:{}
    },
    post:{
      type:Object,
      value:{}
    },
    item:{
      type:Object,
      value:{}
    },
    defaultComment:{
      type:String,
      value:""
    },
    commentC:{
      type:Number,
      value:0
    },
    hasBack:{
      type:Boolean,
      value:false
    },
    level:{
      type:Number,
      value:1
    },
  },
  setup(props,{ emit }) {
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const mainContract = new MainContract(store.state.account);

    const state = reactive({
      //user
      user:props.item.data.user || props.user,
      showUser:false,
      //time
      time:{
        showTime:"",
        hoverTime:""
      },
      //text
      text:"",
      needWrap:true,
      //gas
      gasUsed:formatAmount(props.item.gas_used,24,4),
      //share & like & comment
      detail:{},
      shareCount:props.item.data.shareCount,
      like:{
        hierarchies:props.item.hierarchies,
        accountId:props.item.accountId,
        likeCount:props.item.data.likeCount,
        isLiked:props.item.data.isLiked,
        targetHash:props.item.target_hash,
        communityId:(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT) ? "" : props.item.receiverId
      },
      commentCount:props.commentC || props.item.data.commentCount,
      //child comment
      // showCommentBox:false,
      showCommentList:false,
      currentTab:'',
      commentList:{
        hot:[], 
        new:[]
      },
      page:0,
      limit:10,
      isEnd:false,
      isLoading:false,
      //report | delete | block
      showReportModal:false,
      showDeleteModal:false,
      showBlockModal:false,
      //other
      showall:false,
      copyText:"",
      showLogin:false,
      isBlocked:true,
      focusComment:false,
      addCount:false,
      hasDelete:false,
      showReplyUser:false,
    })

    watch(
      () => props.commentC,
			() => {
        state.addCount = true;
        setTimeout(()=>{
          state.addCount = false;
          state.commentCount = props.commentC;
        },500)
			}
		)

    //text wrap
    const textBox = ref()
    const textDom = ref()
    watch(
      () => textDom.value,
      (newVal) => {
        if(newVal){
          const textBoxHeight = textBox.value.getBoundingClientRect().height;
          const textDomHeight = textDom.value.getBoundingClientRect().height;
          if(textBoxHeight>=textDomHeight){
            state.needWrap = false;
          }else{
            state.needWrap = true;
          }
        }
      }
    )

    const init = async() => {
      //filter blockList
      if(isInBlockList()) return;
      state.isBlocked = false;

      //time
      state.time = getTimer(props.item.createAt)
      //text
      let text = "";
      if(props.item.type != 'encrypt'){
        text = props.item.text
      }else{
        //decrypt
        const res = await proxy.$axios.post.get_decode_content({
          postId:props.item.target_hash,   //postId=>commentId
          accountId:store.getters.accountId
        });
        if(res.success){
          text = res.data.text;
        }
      }
      state.text = text;


      if(props.defaultComment == props.item.target_hash){
        showCommentLayer();
      }
    }

    const isInBlockList = () => {
      const commentBlockList = JSON.parse(localStorage.getItem("commentBlockList")) || [];
      let isBlocked = false;
      commentBlockList.forEach(item=>{
        if(item==props.item.target_hash){isBlocked = true;}
      })
      if(isBlocked){
        return true;
      }
      return false;
    }

    //comment
    const reply = () => {
      if(checkLogin()){
        // if(props.level>=5){return}
        state.focusComment=true;
        // state.showCommentBox=!state.showCommentBox;
        if(props.item.isComment){
          emit("changeCommentListStatus",true);
        }else{
          emit("changeCommentListStatus");
        }
      }
    }
    const comment = (res) => {
      // state.showCommentBox = false;
      emit("changeCommentListStatus",true);
      state.addCount = true;
      emit('comment');
      setTimeout(()=>{
        state.addCount = false;
        state.commentCount += 1;
      },500)
    }
    const commentRefresh = () => {
      state.commentCount += 1;
      setTimeout(()=>{
        changeTab('new');
      },1000);
    }


    //showCommentLayer
    const showCommentLayer = () => {
      if(props.from=='elastic-layer-parent'){return;} // || props.level>=5
      state.detail = {
        ...props.item,
      }
      state.detail.data.likeCount = state.like.likeCount;
      state.detail.data.isLiked = state.like.isLiked;
      state.detail.data.shareCount = state.shareCount;
      document.getElementsByTagName('body')[0].classList.add("fixed");
      state.showCommentList = true;
      changeTab('hot');
    }
    //closeLayer
    const closeLayer = () => {
      document.getElementsByTagName('body')[0].classList.remove("fixed");
      state.showCommentList = false;
      emit('closeLayer');
      if(props.defaultComment == props.item.target_hash){
        emit('resetUrl');
      }
    }
    //changeTab
    const changeTab = async (tab) => {
      // if(state.currentTab == tab) return;
      //reset data
      state.currentTab = tab;
      state.commentList[state.currentTab] = [];
      state.page = 0;
      state.isEnd = false;
      //request
      state.commentList[state.currentTab] = await getChildComments();
    }
    //getChildComments
    const getChildComments = async () => {
      state.isLoading = true;
      const res = await proxy.$axios.comment.get_child_comment_list({
        commentId:props.item.target_hash,
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
        state.commmentCount = res.count;
        state.page += 1;
        return res.data;
      }
      return [];
    }

    //commentsScroll
    const commentLayer = ref();
    const commentsScroll = async () => {
      const commentBox = commentLayer.value;
      if(((commentBox.scrollTop + window.innerHeight) >= commentBox.scrollHeight-200) && !state.isLoading && !state.isEnd){
        const res = await getChildComments();
        state.commentList[state.currentTab] = state.commentList[state.currentTab].concat(res);
      }
    }

    //changeCommentListStatus
    const changeCommentListStatus = (item,close=false) => {
      state.commentList[state.currentTab].forEach(i=>{
        if(i==item && !close){
          i.isComment = true;
        }else{
          i.isComment = false;
        }
      })
    }

    //shareLink
    const getShareLink = () => {
      const parmsJson = JSON.stringify({
        type:'content',
        args:{
          hierarchies:[
            ...props.item.hierarchies,
            {target_hash:props.item.target_hash,account_id : props.item.accountId},
          ],
          inviter_id:store.getters.accountId || '',
          contract_id: props.item.receiverId
        }
      })
      const signature = bs58.encode(Buffer.from(parmsJson));
      return `${window.location.protocol}//${window.location.host}/share/${signature}`;
    }

    const shareRecord = () => {
      if(checkLogin()){
        const params = {
          hierarchies:[
            ...props.item.hierarchies,
            {target_hash:props.item.target_hash,account_id : props.item.accountId},
          ]
        };
        const check_params = {
          ...params,
          account_id: store.getters.accountId,
        }
        if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
          store.state.viewAccount.viewFunction(store.state.nearConfig.MAIN_CONTRACT, "check_shared", check_params).then(check_res => {
            if(!check_res){
              mainContract.share(params).then(()=>{
                state.shareCount++;
              })
            }
          })
        }else{
          store.state.viewAccount.viewFunction(props.item.receiverId, "check_shared", check_params).then(check_res => {
            if(!check_res){
              CommunityContract.new(props.item.receiverId).then(communityContract=>{
                communityContract.share(params).then(()=>{
                  state.shareCount++;
                })
              })
            }
          })
        }
      }
    }

    //share -> handleCopy
    const copy_text = ref()
    const triggerCopy = async (str,isShare) => {
      state.copyText = isShare ? getShareLink() : str;
      nextTick(() => {
        copy_text.value.click();
      });
    }
    const handleCopyFun = () => {
      const clipboard = new Clipboard('#copy_text'+props.item.target_hash)
      shareRecord();
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

    //changeLike
    const changeLike = (res) => {
      state.like.likeCount = res.likeCount;
      state.like.isLiked = res.isLiked;
    }


    //checkLogin
    const checkLogin = () => {
      if(!store.getters.isLogin){
        state.showLogin = true;
        return false;
      }else{
        return true;
      }
    }

    //LoginMask
    const showLoginMask = () => {
      state.showLogin = true
    }
    const closeLoginMask = () => {
      state.showLogin = false
    }

    //redirectPage
    const redirectPage = (path,need_login=true,open_new_tab=false) => {
      if(!store.getters.isLogin && need_login){
        state.showLogin = true
      }else{
        if(!open_new_tab){
          router.push(path);
        }else{
          window.open(window.location.origin+path);
        }
      }
    };

    const textJump = (e) => {
      if(e.target.className=='atFont'){
        redirectPage(`/user-profile/${e.target.textContent.trim().slice(1)}`,false)
      }else{
        showCommentLayer()
      }
    }

    //edit
    const del = async () => {
      if(checkLogin()){
        state.showDeleteModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const deleteConfirm = async () => {
      if(checkLogin()){
        const params = {
          hierarchies : [
            ...props.item.hierarchies,
            {
              target_hash : props.item.target_hash,
              account_id : props.item.accountId,
            }
          ]
        }
        try{
          let res = ''
          if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
            res = await mainContract.delContent(params); 
          }else{
            const communityContract = await CommunityContract.new(props.item.receiverId);
            res = await communityContract.delContent(params);
          }
          if (res == true) {
            state.showDeleteModal = false;
            state.hasDelete = true;
            proxy.$Message({
              message: "delete success",
              type: "success",
            });
          } else  if (res == false) {
            state.showDeleteModal = false;
            throw new Error('error')
          } else {}
        }catch(e){
          state.showDeleteModal = false;
          console.log("delete error:"+e);
          proxy.$Message({
            message: "Delete Failed",
            type: "error",
          });
          return;
        }
      }
    }
    const report = async () => {
      if(checkLogin()){
        state.showReportModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const reportConfirm = async () => {
      if(checkLogin()){
        const params = {
          hierarchies : [
            ...props.item.hierarchies,
            {
              target_hash : props.item.target_hash,
              account_id : props.item.accountId,
            }
          ]
        }
        try{
          let res = ''
          if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
            res = await mainContract.report(params); 
          }else{
            const communityContract = await CommunityContract.new(props.item.receiverId);
            res = await communityContract.report(params);
          }
          if (res == true) {
            state.showReportModal = false;
            proxy.$Message({
              message: "report success",
              type: "success",
            });
          } else  if (res == false) {
            state.showReportModal = false;
            throw new Error('error')
          } else {}
        }catch(e){
          state.showReportModal = false;
          console.log("report error:"+e);
          proxy.$Message({
            message: "Report Failed",
            type: "error",
          });
          return;
        }
      }
    }
    const block = async () => {
      if(checkLogin()){
        state.showBlockModal = true;
        document.getElementsByTagName('body')[0].classList.add("fixed");
      }
    }
    const blockConfirm = async () => {
      if(checkLogin()){
        const commentBlockList = JSON.parse(localStorage.getItem("commentBlockList")) || [];
        let isBlocked = false;
        commentBlockList.forEach(item=>{
          if(item==props.item.target_hash){isBlocked = true;}
        })
        if(!isBlocked){
          commentBlockList.push(props.item.target_hash);
          localStorage.setItem("commentBlockList",JSON.stringify(commentBlockList));
        }
        state.showBlockModal = false;
        proxy.$Message({type: "success",message: "block success"});
        state.isBlocked = true;
      }
    }

    const shareTwitter = async () => {
      shareRecord();
      window.open('https://twitter.com/intent/tweet?text='+getShareLink());
    }


    return {
      ...toRefs(state),
      init,
      textBox,
      textDom,
      commentRefresh,
      reply,
      comment,
      showCommentLayer,
      closeLayer,
      changeTab,
      commentLayer,
      commentsScroll,
      changeCommentListStatus,
      copy_text,
      triggerCopy,
      handleCopyFun,
      changeLike,
      showLoginMask,
      closeLoginMask,
      redirectPage,
      textJump,
      del,
      deleteConfirm,
      report,
      reportConfirm,
      block,
      blockConfirm,
      shareTwitter
    };
  },
  mounted(){
    this.init();
  }
}
</script>
<style lang="scss" scoped>
  .comment-item-box{
    border-top:1px solid rgba(255,255,255,0.1);
    &:first-child{
      border:0;
    }
  }
  .comment-item{
    background: #28282D;
    border-radius: 24px;
    padding:20px 0;
    cursor: pointer;
    &.layer-comment-item{
      padding:20px 0;
    }
    .user{
      height:40px;
      display:flex;
      align-items: center;
      position: relative;
      .avatar{
        width: 40px;
        height: 40px;
        border-radius:50%;
        cursor: pointer;
        object-fit: cover;
      }
      .user-info{
        margin-left:12px;
        .name{
          height: 18px;
          display:flex;
          align-items: center;
          .name-txt{
            max-width: 300px;
            font-family: D-DINExp-Bold;
            height: 18px;
            line-height:18px;
            font-size: 18px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            cursor: pointer;
          }
          .user-flag{
            margin-left:4px;
            width: 20px;
            height: 14px;
            &.op{
              background:url("@/assets/images/common/op.png") no-repeat right center;
              background-size:20px 14px;
            }
            &.co{
              background:url("@/assets/images/common/co.png") no-repeat right center;
              background-size:20px 14px;
            }
            &.mod{
              width:28px;
              background:url("@/assets/images/common/mod.png") no-repeat right center;
              background-size:28px 14px;
            }
          }
        }
        .createtime{
          margin-top:4px;
          font-family: D-DINExp;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
        }
      }
      .icon-edit{
        position: absolute;
        top:0;
        right:0;
        cursor: pointer;
      }
    }
    .reply-user{
      margin:10px 0;
      position: relative;
      top:10px;
      font-family: D-DINExp;
      font-size: 16px;
      color: rgba(255,255,255,0.50);
      letter-spacing: 0;
      line-height: 17px;
      font-weight: 400;
      span{
        color: #FED23C;
        cursor: pointer;
      }
    }
    .text{
      margin-top:20px;
      font-family: D-DINExp;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      text-align: justify;
      line-height: 26px;
      font-weight: 400;
      cursor: pointer;
      pre{
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: D-DINExp;
        font-size: 16px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: justify;
        line-height: 26px;
        font-weight: 400;
      }
    }
    .info-bottom{
      margin-top:20px;
      display:flex;
      justify-content:space-between;
      .info-left{
        display:flex;
        .status{
          margin-right:30px;
          width:60px;
          height: 24px;
          background: #36363C;
          border-radius: 12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family: PingFangSC-Regular;
          font-size: 12px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
        }
        .hash{
          margin-left:30px;
          font-family: D-DINExp;
          font-size: 14px;
          line-height:24px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          padding-right:16px;
          background:url("@/assets/images/post-item/icon-jump.png") no-repeat right center;
          background-size:12px 12px;
          &:hover{
            color: rgba(255,255,255,1);
            background:url("@/assets/images/post-item/icon-jump-hover.png") no-repeat right center;
            background-size:12px 12px;
          }
        }
      }
      .info-right{
        display:flex;
        justify-content:space-between;
        >div{
          margin-left:30px;
          padding-left:30px;
          font-family: D-DINExp;
          font-size: 14px;
          line-height:24px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: right;
          font-weight: 400;
          cursor:pointer;
          &.share{
            background:url("@/assets/images/post-item/icon-share.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-share-hover.png");
            }
          }
          &.comment{
            background:url("@/assets/images/post-item/icon-comment.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-comment-hover.png");
            }
          }
          &.like{
            background:url("@/assets/images/post-item/icon-unlike.png") no-repeat left center;
            background-size:24px 24px;
            &:hover{
              background-image:url("@/assets/images/post-item/icon-unlike-hover.png");
            }
            &.liked{
              background-image:url("@/assets/images/post-item/icon-like.png");
            }
          }
        }
        
      }
    }
    
  }
  .elastic-layer{
    .back{
      position:absolute;
      top:30px;
      left:30px;
      background: rgba(255,255,255,0.12) url("@/assets/images/common/icon-back.png") no-repeat center center;
      background-size:24px 24px;
      z-index:10;
    }
    .child-comments-box{
      width:706px;
      margin:0 auto;
      .parent-comment{
        padding:0 20px;
        background: #28282D;
        border-radius: 24px;
        margin-bottom:20px;
      }
      .all-comments-title{
        margin-top:60px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        .filter-menu{
          margin-top:0;
        }
      }
      .child-comments{
        margin-top:20px;
        padding:0 20px;
        background: #28282D;
        border-radius: 24px;
      }
    }
  }
</style>
