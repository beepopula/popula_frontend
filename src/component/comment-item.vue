<template>
  <div v-if="!isBlocked && !hasDelete">
    <div :class="['comment-item',from=='elastic-layer' ? 'layer-comment-item' : '']" @click.self="showCommentLayer()">
      <!-- user -->
      <div class="user" v-if="$props.item.data">
        <!-- avatar -->
        <el-popover placement="bottom-start"  trigger="hover" @show="showUser=true" @hide="showUser=false">
          <template #reference>
            <img v-if="user.avatar" class="avatar" :src="user.avatar" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
            <img v-else  class="avatar" src="@/assets/images/common/user-default.png" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
          </template>
          <template v-if="showUser">
            <UserPopup :account="item.accountId" @login="showLogin=true"/>
          </template>
        </el-popover>

        <!-- userinfo -->
        <div class="user-info">
          <div class="name" @click="redirectPage('/user-profile/'+item.accountId,false)">
            {{item.accountId}}
            <!--
            <div class="landlord-flag" v-if="post.accountId == item.accountId">landlord</div>
            -->
          </div>
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="createtime">{{time.showTime}}</div>
            </template>
            <div class="pop-box pop-tip">{{time.hoverTime}}</div>
          </el-popover>
        </div>

        <!-- edit -->
        <el-popover placement="bottom-end"  trigger="hover">
          <template #reference>
            <img class="icon icon-edit" src="@/assets/images/post-item/icon-more.png"/>
          </template>
          <div class="pop-box pop-edit">
            <!-- self -->
            <template v-if="user.account_id == $store.getters.accountId">
              <div class="pop-edit-item" @click="del()">
                <img class="icon16" src="@/assets/images/post-item/icon-delete.png"/>
                Delete
              </div>
            </template>
            <!-- other people -->
            <template v-else>
              <div class="pop-edit-item" @click="report()">
                <img class="icon16" src="@/assets/images/post-item/icon-report.png"/>
                Report
              </div>
              <div class="pop-edit-item" @click="block()">
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
            <span>@{{item.data.replay}}</span>
          </template>
          <template v-if="showReplyUser">
            <UserPopup :account="item.data.replay" @login="showLogin=true"/>
          </template>
        </el-popover>
      </div> 
      

      <!-- text -->
      <div class="text text-ellipsis-wrapper" @click="showCommentLayer()">
        <div ref="textBox" :class="['txt','txt-wrap5',needWrap ? '' : 'hidebtn', showall? 'showall' : '']" :style="textStyleObject">
          <!--<pre>{{text}}</pre>-->
          <label class="btn" @click.stop="showall = !showall"></label>
          <pre ref="textDom"><div v-html="text"></div></pre>
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
                <img class="icon-copy" @click="triggerCopy(item.transaction_hash)" src="@/assets/images/common/icon-copy.png">
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
              <div class="pop-edit-item" @click="shareTwitter()">
                <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
                Twitter
              </div>
              <div class="pop-edit-item" @click="triggerCopy(post.target_hash,true)">
                <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
                Cory link
              </div>
            </div>
          </el-popover>
          <!-- reply -->
          <div :class="['comment',addCount ? 'add-count' : '']" @click="reply()">
            <template v-if="commentCount>0">{{commentCount}}</template>
            <template v-else>Reply</template>
          </div>
          <!-- like -->
          <Like :item="like"/>
        </div>
      </div>

      <!-- comment -->
      <div class="comment-box" v-if="from!='elastic-layer-parent' && showCommentBox">
        <Comment 
          :targetHash="item.target_hash" 
          :communityId="item.receiverId" 
          :methodName="post.methodName" 
          :from="'list'"
          :focus="focusComment"
          @comment="comment"
        />
      </div>
    </div>

    <!-- Comment List -->
    <div class="elastic-layer" v-if="showCommentList" @click.self="closeLayer()">
      <div class="edit-button back" v-if="hasBack"  @click="showCommentList=false">{{hasBack}}</div>
      <div class="edit-button close" @click="closeLayer()"></div>
      <div ref="commentLayer" class="child-comments-box" @scroll="commentsScroll()">
        <div class="parent-comment">
          <CommentItem 
            :post="post" 
            :item="item" 
            :commentC="commentCount" 
            :from="'elastic-layer-parent'"
          />
        </div>
        <Comment 
          :targetHash="item.target_hash" 
          :communityId="item.receiverId" 
          :methodName="post.methodName" 
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
            <CommentItem :post="post" :item="item" from="elastic-layer" :hasBack="true" @closeLayer="closeLayer" />
          </template>
        </div>
        <div class="no-more" v-if="isEnd">
          <template v-if="commentCount == 0">No comments</template>
          <template v-else>No more comments</template>
        </div>
      </div>
    </div>

    <!-- #copy_text  display:none;  -->
    <div :data-clipboard-text="copyText" ref="copy_text"  :id="'copy_text'+item.target_hash" @click="handleCopyFun"></div>

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>

  </div>
</template>

<script>
import { ref, reactive, toRefs , watch, nextTick, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import EncryptionContract from "@/contract/EncryptionContract";
import { formatAmount, checkCondition, getTimer} from "@/utils/util.js";
import Clipboard from 'clipboard';
import Comment from '@/component/comment.vue';
import UserPopup from '@/component/user-popup.vue';
import Like from "@/component/like.vue";
import LoginMask from "@/component/login-mask.vue";
export default {
  components: {
    Comment,
    UserPopup,
    Like,
    LoginMask
  },
  props:{
    from:{
      type:String,
      value:""
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
    }
  },
  setup(props,{ emit }) {
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const encryptionContract = new EncryptionContract(store.state.account);

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
      shareCount:props.item.data.shareCount,
      like:{
        likeCount:props.item.data.likeCount,
        isLiked:props.item.data.isLike,
        targetHash:props.item.target_hash,
        communityId:(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT) ? "" : props.item.receiverId
      },
      //child comment
      commentCount:props.commentC || props.item.data.commentCount,
      showCommentBox:false,
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
        const textBoxHeight = textBox.value.getBoundingClientRect().height;
        const textDomHeight = textDom.value.getBoundingClientRect().height;
        if(textBoxHeight>textDomHeight){
          state.needWrap = false;
        }else{
          state.needWrap = true;
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
      if(props.post.methodName != 'add_encrypt_post'){
        text = props.item.text
      }else{
        //decrypt
        const result = await proxy.$axios.post.get_sign({
          postId:props.post.target_hash,
          commentId :props.item.target_hash,
          accountId:store.getters.accountId
        });
        const param = {
          cipher_text: JSON.parse(props.item.encrypt_args), 
          contract_id: props.item.receiverId, 
          sign: result.data.text_sign
        }
        const res = await encryptionContract.decrypt(param);
        text = res.text;
      }
      state.text = text;

      // const reg = RegExp(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/,"g");
      // state.text = text.replace(reg,(match)=>{
      //   return `<span class='emoji'>${match}</span>`
      // })

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
        state.focusComment=true;
        state.showCommentBox=!state.showCommentBox;
      }
    }
    const comment = (res) => {
      state.showCommentBox = false;
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
      if(props.from=='elastic-layer-parent'){return;}
      document.getElementsByTagName('body')[0].classList.add("fixed");
      state.showCommentList = true;
      changeTab('hot');
    }
    //closeLayer
    const closeLayer = () => {
      document.getElementsByTagName('body')[0].classList.remove("fixed");
      state.showCommentList = false;
      emit('closeLayer');
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

    //membersScroll
    const commentLayer = ref();
    const commentsScroll = async () => {
      const commentBox = commentLayer.value;
      if(((commentBox.scrollTop + window.innerHeight) >= commentBox.scrollHeight-200) && !state.isLoading && !state.isEnd){
        const res = await getChildComments();
        state.commentList[state.currentTab] = state.commentList[state.currentTab].concat(res);
      }
    }

    //share -> handleCopy
    const copy_text = ref()
    const triggerCopy = async (str,isShare) => {
      state.copyText = isShare ? `${window.location.protocol}//${window.location.host}/detail/${props.post.target_hash}?comment=${props.item.target_hash}` : str;
      nextTick(() => {
        copy_text.value.click();
      });
      if(isShare){
        await shareRecord();
      }
    }
    const handleCopyFun = () => {
      const clipboard = new Clipboard('#copy_text'+props.item.target_hash)
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

    //edit
    const del = async () => {
      if(checkLogin()){
        const res = await proxy.$axios.comment.delete({
          commentId:props.item.target_hash,
          accountId:store.getters.accountId || ''
        });
        if(res.success){
          proxy.$Message({
            message: "delete success",
            type: "success",
          });
          state.hasDelete = true;
        }
      }
    }
    const report = async () => {
      if(checkLogin()){
        const res = await proxy.$axios.post.report({
          commentId:props.item.target_hash,
          accountId:store.getters.accountId || ''
        });
        if(res.success){
          proxy.$Message({
            message: "report success",
            type: "success",
          });
        }
      }
    }
    const block = async () => {
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
        proxy.$Message({type: "success",message: "block success"});
        state.isBlocked = true;
      }
    }

    //shareRecord
    const shareRecord = async () => {
      const res = await proxy.$axios.post.share_record({
        target_hash:props.item.target_hash,
        accountId:store.getters.accountId
      });
      if(res.success){
        state.shareCount = parseInt(state.shareCount) + 1;
      }
    }

    const shareTwitter = async () => {
      await shareRecord();
      const text = `${window.location.protocol}//${window.location.host}/detail/${props.post.target_hash}?comment=${props.item.target_hash}`;
      window.open('https://twitter.com/intent/tweet?text='+text);
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
      copy_text,
      triggerCopy,
      handleCopyFun,
      showLoginMask,
      closeLoginMask,
      redirectPage,
      del,
      report,
      block,
      shareTwitter
    };
  },
  mounted(){
    this.init();
  }
}
</script>
<style lang="scss" scoped>
  .comment-item{
    background: #28282D;
    border-radius: 24px;
    padding:30px 0;
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
      }
      .user-info{
        margin-left:12px;
        .name{
          font-family: D-DINExp-Bold;
          height: 18px;
          line-height:18px;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          position: relative;
          cursor: pointer;
          .landlord-flag{
            position:absolute;
            top:1px;
            right:-107px;
            display:flex;
            justify-content: center;
            align-items: center;
            width: 100px;
            height: 32px;
            font-family: D-DINExp;
            font-size: 20px;
            line-height:20px;
            color: #FFFFFF;
            letter-spacing: 0;
            background: #ED1F5A;
            border: 2px solid rgba(0,0,0,1);
            border-radius: 8px;
            transform-origin:left top;
            transform:scale(0.5);
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
        color: #0084FF;
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
    display:flex;
    justify-content:center;
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
      padding:60px 10px 60px 0;
      overflow-y:scroll;
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
