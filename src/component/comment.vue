<template>
  <div :class="['comment',from == 'list' ? 'comment-reply' : '']">
    <!-- text -->
    <el-input ref="commentInput" v-model="text" @focus="checkLogin()" rows="1"  :autosize="true"  placeholder="Add a comment." maxlength="300"  type="textarea" :show-word-limit="text.trim().length>0" />
    <!-- avatar -->
    <img class="avatar" v-if="$store.getters.isLogin && $store.state.profile.avatar" :src="$store.state.profile.avatar"/>
    <img class="avatar" v-else src="@/assets/images/common/user-default.png"/>
    <div class="edit">
      <!-- emoji -->
      <div class="emoji-box" style="position:relative;">
        <discord-picker
          :value="value"
          gif-format="md"
          @update:value="value = $event"
          @emoji="setEmoji"
          @gif="setGif"
        />
      </div>
      <!-- reply button -->
      <div :id="'pop-reply-notice'+targetHash" :class="['mini-button-border','button-replay',!text.trim() ? 'disabled' : '']">
        <div class="mini-button" @click="reply()">Reply</div>
        <!-- comment notice -->
        <div class="pop-box pop-intro pop-notice" v-if="showNotice">
          <div class="title">Notice</div>
          <div class="intro">This action will be recorded as a transaction on Near Protocol, details can be verify on <a href="https://wallet.testnet.near.org/" target="_blank">Recent activity</a></div>
          <div class="button-box">
            <div class="mini-button-border button-cancle" @click.stop="showNotice=false">
              <div class="mini-button">Cancle</div>
            </div>
            <div class="mini-button-border" @click="confirmReply()">
              <div class="mini-button">Confirm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
import { ref, reactive, toRefs , onMounted ,watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import CommunityContract from "@/contract/CommunityContract";
import EncryptionContract from "@/contract/EncryptionContract";
import LoginMask from "@/component/login-mask.vue";
import DiscordPicker from 'vue3-discordpicker';
export default {
  props:{
    from:{
      type:String,
      value:""
    },
    targetHash:{
      type:String,
      value:""
    },
    communityId:{
      type:String,
      value:""
    },
    methodName:{
      type:String,
      value:""
    },
    focus:{
      type:Boolean,
      value:false
    }
  },
  components: {
    LoginMask,
    DiscordPicker
  },
  setup(props,{ emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const mainContract = new MainContract(store.state.account);
    const encryptionContract = new EncryptionContract(store.state.account)

    //state
    const state = reactive({
      text:"",
      targetHash: props.targetHash,
      showNotice:false,
      showLogin:false,
    })

    const commentInput = ref()
    watch(
      () => props.focus,
			() => {
        commentInput.value.focus()
			}
		)

    //init
    const init = () => {
      if(props.focus){
        commentInput.value.focus()
      }
    }

    //checkLogin
    const checkLogin = () => {
      if(!store.getters.isLogin){
        commentInput.value.blur()
        state.showLogin = true;
        return false;
      }else{
        return true;
      }
    }

    //emoji
    const setEmoji = (emoji) => {
      const selection = commentInput.value.$el.getElementsByTagName('textarea')[0].selectionStart;
      const left = state.text.substring(0,selection);
      const right = state.text.substring(selection);
      console.log(left,emoji,right,);
      state.text = left + emoji + " " + right;
      // state.text = state.text + emoji + " ";;
    }
    const setGif = (gif) => {
      state.text = state.text + emoji;
    }

    const confirmReply = () => {
      state.showNotice = false;
      localStorage.setItem("replyAlerted",true)
      reply();
    }

    //reply
    const reply = async () => {
      if(!state.text || !checkLogin()){
        return;
      }
      //notice
      if(!localStorage.getItem("replyAlerted")){
        state.showNotice = true;
        return;
      }

      if(props.methodName == "add_encrypt_post"){
        await encryptReply();
      }else{
        await publicReply();
      }
      emit("comment");
    }

    const publicReply = async () => {
      const params = {   
        args:JSON.stringify({text: state.text}), 
        target_hash: state.targetHash,
      }

      let result = {}
      if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
        const communityContract = await CommunityContract.new(props.communityId);
        result = await communityContract.addComment(params,store.state.account,props.communityId);
      }else{
        result = await mainContract.addComment(params,store.state.account);
      }
      handleSuccess(result);
    }

    const encryptReply = async () => {
      //encrypt
      const param1 = {
        plain_text:{
          text:state.text,
        },
        contract_id:props.communityId,
      }
      const res = await encryptionContract.encrypt(param1);
      // addEncryptComment
      const param2 = {
        encrypt_args:JSON.stringify(res.cipher_text), 
        text_sign:res.text_sign,
        contract_id_sign:res.contract_id_sign,
        target_hash: props.targetHash,
      }

      let result = {}
      if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
        // const communityContract = new CommunityContract(store.state.account,props.communityId);
        const communityContract = await CommunityContract.new(props.communityId);
        result = await communityContract.addEncryptComment(param2,store.state.account,props.communityId);
      }else{
        result = await mainContract.addEncryptComment(params2,store.state.account);
      }
      handleSuccess(result);
    }

    //handleSuccess
    const handleSuccess = (res) => {
      state.text = ""
      if (res) {
        proxy.$Message({
          message: "Comment Success",
          type: "success",
        });
      } else {
        proxy.$Message({
          message: "Oops,something went wrong. Please try again or submit a report.",
          type: "error",
        });
      }
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
      commentInput,
      init,
      checkLogin,
      setEmoji,
      setGif,
      confirmReply,
      reply,
      showLoginMask,
      closeLoginMask,
    };
  },
  mounted(){
    this.init();
    document.addEventListener('click',(e) => {
      const pop_notice = document.getElementById('pop-reply-notice'+ this.$props.targetHash);
      if(this.showNotice && pop_notice &&　!pop_notice.contains(e.target)) {
          this.showNotice = false;
      }
    })
  },
}
</script>

<style lang="scss" scoped>
.comment{
  width: 696px;
  padding:20px;
  background: #28282D;
  border-radius: 24px;
  position:relative;
  &.comment-reply{
    width:650px;
    padding:20px 0 0 0;
    :deep(.el-textarea){
      border-radius: 10px;
      background: #111113;
    }
    .avatar{
      left:20px;
    }
  }
  :deep(.el-textarea){
    border-radius: 10px;
    background: #36363C;
    max-height:30vh;
    overflow-y:scroll;
    textarea{
      background: transparent;
      padding:20px 14px 20px 56px;
      font-family: D-DINExp;
      font-size: 16px;
      line-height:20px;
      padding-bottom:40px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      border:0;
      resize:none;
      word-break:break-word;
    }
    .el-input__count{
      background:transparent;
      opacity: 0.5;
      font-family: D-DINExp-Bold;
      font-size: 12px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      bottom:15px;
      right:15px;
    }
  }
  .avatar{
    width: 24px;
    height: 24px;
    border-radius:50%;
    position:absolute;
    top:40px;
    left:40px;
    object-fit: cover;
  }
  .edit{
    margin-top:20px;
    height:36px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    :deep(.el-upload) {
      width: 24px;
      height: 24px;
      border:0;
      cursor: pointer;
      margin-right:30px;
      background:transparent;
      border-radius:0;
      line-height:24px;
      vertical-align: top;
    }
    .button-replay{
      position:relative;
      .pop-notice{
        position:absolute;
        top:46px;
        left:0;
      }
    }
  }
}
</style>