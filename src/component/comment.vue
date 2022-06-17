<template>
  <div :class="['comment',from == 'list' ? 'comment-reply' : '']">
    <!-- text -->
    <div :class="['input-box',text.trim().length>0 ? '' :'input-box-empty']">
      <div
        class="div-input"
        ref="commentInput"
        contenteditable
        @keydown.capture="onCheck"
        @keyup.capture="onChange"
        @focus="checkLogin"
        @click="onClick"
      />
      <div v-if="!text" class="placeholder">Add a comment.</div>
      <div class="pop-user-box">
        <div v-show="showUserList" ref="popUser" class="user-list">
          <div class="loading-box" v-if="isLoaingUserList">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <template v-else-if="userList.length>0">
            <template v-for="user in userList">
                <template v-if="user.data">
                  <el-popover placement="bottom-start"  trigger="hover" @show="user.showCreateUser=true" @hide="user.showCreateUser=false">
                    <template #reference>
                      <div class="user-item" @click="onSelectSubmit(user)">
                        <img v-if="user.avatar" class="user-avatar" :src="user.avatar"/>
                        <img v-else  class="user-avatar" src="@/assets/images/common/user-default.png"/>
                        <div class="user-info">
                          <div class="user-name  txt-wrap" v-if="user.name">{{user.name}}</div>
                          <div class="user-account  txt-wrap">{{user.account_id}}</div>
                        </div>
                      </div>
                    </template>
                    <template v-if="user.showCreateUser">
                      <UserPopup :account="user.account_id" @login="showLogin=true"/>
                    </template>
                  </el-popover>
                </template>
                <template v-else>
                  <div class="user-item" @click="onSelectSubmit(user)">
                    <img v-if="user.avatar" class="user-avatar" :src="user.avatar"/>
                    <img v-else  class="user-avatar" src="@/assets/images/common/user-default.png"/>
                    <div class="user-info">
                      <div class="user-name  txt-wrap" v-if="user.name">{{user.name}}</div>
                      <div class="user-account  txt-wrap">{{user.account_id}}</div>
                    </div>
                  </div>
                </template>
            </template>
          </template>
          <div v-else class="nobody">Nobody yet.</div>
        </div>
      </div>

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

      <el-input v-model="text" @focus="checkLogin()" rows="1"  :autosize="true"  placeholder="Add a comment." maxlength="300"  type="textarea" :show-word-limit="text.trim().length>0" />
    </div>
    <!-- avatar -->
    <img class="avatar" v-if="$store.getters.isLogin && $store.state.profile.avatar" :src="$store.state.profile.avatar"/>
    <img class="avatar" v-else src="@/assets/images/common/user-default.png"/>
    <div class="edit">
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
import UserPopup from '@/component/user-popup.vue';
import LoginMask from "@/component/login-mask.vue";
import DiscordPicker from 'vue3-discordpicker';
export default {
  props:{
    from:{
      type:String,
      value:""
    },
    hierarchies:{
      type:Array,
      value:[]
    },
    parentAccount:{
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
    postType:{
      type:String,
      value:""
    },
    focus:{
      type:Boolean,
      value:false
    }
  },
  components: {
    UserPopup,
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

      focusNode:null,
      focusOffset:null,
      start_index:null,
      end_index:null,
      isLoaingUserList:false,
      showUserList:false,
      userList:[],
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
    //@
    const onCheck = (e) => {
      if(commentInput.value.textContent.length>=300 && e.key != 'Backspace'){
        e.preventDefault();
      }
    }
    const onClick = () => {
      const selection = window.getSelection()
      state.focusNode = selection.focusNode;
      state.focusOffset = selection.focusOffset;
      state.start_index = selection.focusOffset;
    }
    const onChange = async (e) => {
      const selection = window.getSelection()
      const text = selection.extentNode.nodeValue;
      state.text = commentInput.value.textContent;
      state.focusNode = selection.focusNode;
      state.focusOffset = selection.focusOffset;
      let start = Math.max(selection.focusOffset-21,0);
      let start_index = null;

      for(let i = selection.focusOffset-1;i>=start;i--){
        if(text.substring(i,i+1)=="@"){
          start_index = i;
          break;
        }
        if(i!=selection.focusOffset-1 && !(text[i].trim())){
          break;
        }
      }
      

      if(start_index!==null){
        let end = Math.min(start_index+21,text.length);
        let end_index = end;
        const start = Math.max(selection.focusOffset-1,0)
        for(let j = start;j<end;j++){
          if(text[j]==" " || text[j]=="@"){
            end_index = j;
            break;
          }
        }
        const str = text.substring(start_index+1,end_index).trim();
        if(str.length>2){
          state.focusNode = selection.focusNode;
          state.start_index = start_index;
          state.end_index = end_index;
          debounceInput(str);
        }else{
          state.showUserList = false;
        }
      }else{
        state.start_index = selection.focusOffset;
        state.showUserList = false;
      }
    }

    //selectUser @
    const searchUser = async (str) => {
      state.showUserList = true;
      state.isLoaingUserList = true;
      const res = await proxy.$axios.post.at({
        accountId:str,
      });
      if(res.success){
        const list = [];
        const len = Math.min(res.data.length,5)
        for(let i =0;i<len;i++){
          const user = await proxy.$axios.profile.get_user_info({
            accountId:res.data[i]['account_id'],
            currentAccountId: store.getters.accountId || ''
          });
          if(user.success){
            list.push(user.data);
            // state.joinedCommunities = state.user.data.joinedCommunities.slice(0,3)
          }else{
            list.push({account_id:res.data[i]['account_id']});
          }
        }
        state.userList = list;
      }
      // console.log("1111111");
      state.isLoaingUserList = false;
    }
    const debounce = (fn, delay) => {
      let timeout;
      return function(){
        clearTimeout(timeout)
        timeout = setTimeout(()=>{
          fn.apply(this, arguments)
        },delay)
      }
    }
    const debounceInput = debounce(searchUser, 300);
    const onSelectSubmit = (item) => {
      let selection = window.getSelection();
      let range = window.getSelection().getRangeAt(0);
      
      range.setStart(state.focusNode, state.start_index);
      range.setEnd(state.focusNode, state.end_index);

      range.deleteContents();

      var spanNode1= document.createElement('span');
      var spanNode2 = document.createElement('span');
      spanNode1.className = 'atFont';
      spanNode1.style="color:#FED23C;";
      spanNode1.innerHTML = '@' + item.account_id;
      spanNode1.contentEditable = false;
      spanNode2.innerHTML = '&nbsp;';
      var frag = document.createDocumentFragment(),
        node,
        lastNode;
      frag.appendChild(spanNode1);
      while ((node = spanNode2.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      selection.extend(lastNode, 1);
      selection.collapseToEnd();
      //reset
      const sel = window.getSelection();
      state.focusNode = sel.focusNode;
      state.focusOffset = sel.focusOffset;
      state.showUserList = false;
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
      // const selection = commentInput.value.$el.getElementsByTagName('textarea')[0].selectionStart;
      // const left = state.text.substring(0,selection);
      // const right = state.text.substring(selection);
      // console.log(left,emoji,right,);
      // state.text = left + emoji + " " + right;

      if(checkLogin()){
        if(commentInput.value.textContent && state.focusNode && state.focusNode.insertData){
          let selection = window.getSelection();
          let range = selection.getRangeAt(0);
          const container = state.focusNode; 
          const pos = state.focusOffset;
          //insert
          range = document.createRange(); 
          var cons = window.document.createTextNode(emoji); 
          container.insertData(pos, cons.nodeValue); 
          range.setEnd(container, pos + cons.nodeValue.length); 
          range.setStart(container, pos + cons.nodeValue.length); 
          state.focusOffset = pos + cons.nodeValue.length;

          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }else{
          commentInput.value.innerHTML = commentInput.value.innerHTML + emoji;
        }
        state.text = commentInput.value.textContent;

        // selection.addRange(range); 
        // selection.collapseToEnd();
      }
    }
    const setGif = (gif) => {
      state.text = state.text + gif;
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
      proxy.$Loading.showLoading({title: "Loading"});

      try{
        const parent_hierarchies = props.hierarchies || [];
        let hierarchies = [];
        //hierarchies
        if(parent_hierarchies.length==0){//level 1
          hierarchies = [
            {
              target_hash: props.targetHash,
              account_id: props.parentAccount
            },
            // {
            //   target_hash: 'bNw4SwipyY7s6fa3FBBTk155xTaTnXgY1TFfAg9qCiX',//props.targetHash,
            //   account_id:'billkin.testnet'//props.parentAccount
            // },
            // {
            //   target_hash: "8ExQhQKEb8c4XbxKUx6pC2wS3yKTGie9m2ZKcy9V8DM9",//props.targetHash,
            //   account_id:'billkin.testnet'//props.parentAccount
            // },
          ]
        }else if(parent_hierarchies.length==1){//level 2
          hierarchies = [
            ...parent_hierarchies,
            {
              target_hash : props.targetHash,
              account_id : props.parentAccount,
            }
          ]
        }else if(parent_hierarchies.length==2){//level > 2
          hierarchies = [
            ...parent_hierarchies
          ]
        }
        // console.log(hierarchies); return;
        //options
        const options = [];
        if(commentInput.value.innerHTML){
          const reg = RegExp(/<span[^>]*>([\s\S]*?)<\/span>/,"g");
          let r= '';
          while ((r= reg.exec(commentInput.value.innerHTML)) != null) {
            options.push({At:r[1].trim().substring(1)});
          }
        }
        //submit
        if(props.postType == "encrypt"){
          await encryptReply(hierarchies,options);
        }else{
          await publicReply(hierarchies,options);
        }
      }catch(e){
        proxy.$Loading.hideLoading();
        proxy.$Message({
          message: "Reply Failed",
          type: "error",
        });
        console.log("reply error:"+e);
        return;
      }

      proxy.$Loading.hideLoading();
      emit("comment");
    }

    const publicReply = async (hierarchies,options) => {
      const params = {   
        args:JSON.stringify({text: commentInput.value.innerHTML}), 
        hierarchies,
        options,
        target_hash: state.targetHash,
      }

      let result = {}
      if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
        const communityContract = await CommunityContract.new(props.communityId);
        result = await communityContract.addContent(params,store.state.account,props.communityId);
      }else{
        result = await mainContract.addContent(params,store.state.account);
      }
      handleSuccess(result);
    }

    const encryptReply = async (hierarchies,options) => {
      //encrypt
      const res = await proxy.$axios.post.add_encrypt_content_sign({
        content:{
          text:commentInput.value.innerHTML
        },
        accountId:store.getters.accountId || ''
      });

      if(res.success){
        // addEncryptComment
        const param2 = {
          target_hash: props.targetHash,
          options,
          hierarchies,
          // encrypt_args:JSON.stringify(res.cipher_text), 
          // text_sign:res.text_sign,
          // contract_id_sign:res.contract_id_sign,
          encrypt_args:res.data.encode,
          nonce:res.data.nonce.toString(),
          sign:res.data.sign,
        }
        let result = {}
        if(props.communityId != store.state.nearConfig.MAIN_CONTRACT && props.communityId != store.state.nearConfig.NFT_CONTRACT){
          // const communityContract = new CommunityContract(store.state.account,props.communityId);
          const communityContract = await CommunityContract.new(props.communityId);
          result = await communityContract.addEncryptContent(param2,store.state.account,props.communityId);
        }else{
          result = await mainContract.addEncryptContent(param2,store.state.account);
        }
        handleSuccess(result);
      }else{
        throw new Error("Encrypt Failed: " + res.message);
      }
    }

    //handleSuccess
    const handleSuccess = (res) => {
      state.text = ""
      if (res) {
        proxy.$Message({
          message: "Comment Success",
          type: "success",
        });
        resetInfo()
      } else {
        proxy.$Message({
          message: "Oops,something went wrong. Please try again or submit a report.",
          type: "error",
        });
      }
    }

    const resetInfo = () => {
      commentInput.value.innerHTML = "";
      state.text = "";
      state.focusNode = null;
      state.focusOffset = null;
      state.start_index = null;
      state.end_index = null;
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
      onCheck,
      onClick,
      onChange,
      onSelectSubmit,
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
  width: 690px;
  padding:20px;
  background: #28282D;
  border-radius: 24px;
  position:relative;
  &.comment-reply{
    width:650px;
    padding:20px 0 0 0;
    .input-box{
      background: #111113;
    }
    :deep(.el-textarea){
      border-radius: 10px;
      background: transparent;
    }
    .avatar{
      left:20px;
    }
  }
  .input-box{
    position: relative;
    background: #36363C;
    border-radius: 10px;
    &.input-box-empty{
      .div-input{
        padding-bottom:20px;
      }
      .emoji-box{
        left:auto;
        right:-10px;
      }
    }
  }
  .div-input{
    position: relative;
    z-index: 3;
    font-family: D-DINExp;
    font-size: 16px;
    line-height:24px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    border:0;
    -webkit-user-modify: read-write-plaintext-only;
    padding:20px 14px 80px 56px;
    
  }
  .atFont{
    font-family: D-DINExp;
    font-size: 16px;
    color: #FED23C;
    letter-spacing: 0;
    text-align: justify;
    line-height: 24px;
    font-weight: 400;
  }
  .placeholder{
    position:absolute;
    top:20px;
    left:56px;
    opacity: 0.2;
    font-family: D-DINExp;
    font-size: 14px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    line-height:24px;
    z-index:1;
  }
  .pop-user-box{
    position:relative;
    top:-60px;
    left:20px;
    .user-list{
      position:absolute;
      top:0;
      left:0;
      z-index:20;
      background: #000000;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0px 2px 30px 0px rgba(0,0,0,0.5);
      border-radius: 10px;
      width:200px;
      .loading-box{
        height:50px;
        display:flex;
        align-items: center;
        justify-content:center;
      }
      .nobody{
        height:50px;
        display:flex;
        align-items: center;
        justify-content:center;
        opacity: 0.5;
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        line-height: 14px;
        font-weight: 400;
      }
      .user-item{
        height:50px;
        display:flex;
        align-items: center;
        padding:0 20px;
        cursor:pointer;
        &:hover{
          background: rgba(40,40,45,0.5);
        }
        .user-avatar{
          width:30px;
          height:30px;
          border-radius:50%;
        }
        .user-info{
          margin-left:10px;
          .user-name{
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 14px;
            font-weight: 700;
            width:90px;
          }
          .user-account{
            margin-top:2px;
            opacity: 0.5;
            font-family: D-DINExp;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 14px;
            font-weight: 400;
            width:90px;
          }
        }
      }
    }
  }
  .emoji-box{
    position: absolute!important;
    left:20px;
    bottom:20px;
  }
  :deep(.el-textarea){
    border-radius: 10px;
    background: transparent;
    max-height:30vh;
    overflow-y:scroll;
    position:absolute;
    width:55px;
    height:20px;
    bottom:15px;
    right:15px;
    textarea{
      display:none;
      background: transparent;
      padding-right:14px;
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
      display:inline;
      right:0;
      bottom:0;
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
    justify-content:flex-end;
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