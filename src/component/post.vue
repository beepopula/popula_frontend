<template>
  <div class="post" :id="'post'+location" :key="location">
    <div class="postForm">
      <!-- text -->
      <div
        class="div-input"
        ref="postInput"
        contenteditable
        @keydown.capture="onCheck"
        @keyup.capture="onChange"
        @focus="checkLogin"
        @click="onClick"
      />
      <div v-if="!postForm.text" class="placeholder">Share your story with the community.</div>
      
      <div class="pop-user-box" :id="'pop-user'+location">
        <div v-show="showUserList" ref="popUser" class="user-list">
          <div class="loading-box" v-if="isLoaingUserList">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <template v-else-if="userList.length>0">
            <template v-for="user in userList">
                <template v-if="user.outer">
                  <div class="user-item" @click="onSelectSubmit(user)">
                    <img v-if="user.avatar" class="user-avatar" :src="user.avatar"/>
                    <img v-else  class="user-avatar" src="@/assets/images/common/user-default.png"/>
                    <div class="user-info">
                      <div class="user-name  txt-wrap" v-if="user.name">{{user.name}}</div>
                      <div class="user-account  txt-wrap">{{user.account_id}}</div>
                    </div>
                  </div>
                </template>
                <template v-else>
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
            </template>
          </template>
          <div v-else class="nobody">Nobody yet.</div>
        </div>
      </div>
      <!-- avatar -->
      <img class="avatar" v-if="$store.getters.isLogin && $store.state.profile.avatar" :src="$store.state.profile.avatar"/>
      <img class="avatar" v-else src="@/assets/images/common/user-default.png"/>


      <!-- images -->
      <div class="images" >
        <div :class="['image-item',index%3==2?'mr0':'']" v-for="(img,index) in postForm.imgs" @click="imagePreview(index)">
          <div class="delete-image" @click.stop="handleRemove(index)"></div>
          <img :src="img" >
        </div>
      </div>

      <div @click="onFocus()">
        <el-input v-model="postForm.text" @focus="checkLogin()"  placeholder="Share your story with the community." rows="1" :autosize="true" maxlength="1000"  type="textarea" :show-word-limit="postForm.text.trim().length>0" />
      </div>
      <!-- img-emoji-box -->
      <div class="img-emoji-box">
        <!-- upload-image -->
        <div class="icon-image" @click="uploadImage()"></div>
        <el-upload
          :id="'upload-image'+location"
          class="upload-image"
          action=""
          accept="image/png, image/jpeg, image/jpg, image/gif"
          multiple
          :show-file-list="false"
          list-type="picture-card"
          :http-request="uploadImg"
          :before-upload="beforeUpload"
          >
        </el-upload>
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
      </div>
      


    </div>
    <div class="edit">
      <!-- community -->
      <div :id="'pop-community'+location" class="community-select">
        <!-- community selected -->
        <div class="community-selected" @click="showCommunityBox()">
          <template v-if="postForm.community.communityId">
            <img v-if="postForm.community.avatar" :src="postForm.community.avatar">
            <img v-else src="@/assets/images/test/community.png">
            <div class="txt-wrap">{{postForm.community.name}}</div>
          </template>
          <template v-else>
            Community
          </template>
        </div>
        <!-- community select -->
        <div class="pop-box pop-intro pop-community-select" v-if="showCommunity && joinedCommunities.length>0">
          <div class="title">Choose Community</div>
          <div class="intro">Choose the community you want to share with.</div>
          <div class="joined-list" >
            <template v-for="item in joinedCommunities">
              <div v-if="item.name" :class="['joined-item',item.communityId == postForm.community.communityId ? 'active' : '']" @click="selectCommunity(item)">
                <img v-if="item.avatar" :src="item.avatar">
                <img v-else src="@/assets/images/test/community.png">
                <div class="txt-wrap">{{item.name}}</div>
              </div>
            </template>
          </div>
        </div>
        <!-- community join -->
        <div class="pop-box pop-intro pop-community-join" v-else-if="showCommunity">
          <div class="title">Choose Community</div>
          <div class="intro">You  haven't  joined  the  community  yet. Please  join  or  create  it.</div>
          <div class="button-box">
            <div class="mini-button-border button-cancle" @click="showCommunity=false">
              <div class="mini-button">Cancle</div>
            </div>
            <div class="mini-button-border" @click="redirectPage('/communities')">
              <div class="mini-button">Go</div>
            </div>
          </div>
        </div>
      </div>
      <!-- token -->
      <div class="post-type" >
        <!-- Token-gated -->
        <div :id="'pop-token'+location" class="type-select">
          <div class="token-gated" @click="chooseType()">
            Token-gated
            <template v-if="postForm.access.length>0">
              <div :class="['selected-list','selected-list'+postForm.access.length]">
                <img v-for="(item,index) in postForm.access" :class="['token-icon','token-icon'+index]" :src="item.icon"/>
              </div> 
            </template>
          </div>
          <div class="pop-box pop-intro pop-token-gated" v-if="showTokenBox">
            <div class="title">Token-gated</div>
            <div class="intro">Only the holder of token(s) listed below can get fully access of this content.</div>
            <div class="token-selected" v-if="postForm.access.length>0">
              <div :class="'token-selected-item'" v-for="(item,index) in postForm.access">
                <div class="close" @click.stop="deleteToken(index)"></div>
                <img class="token-icon" :src="item.icon"/>
                <div class="token-symbol">{{item.symbol}}</div>
                <el-input v-model="item.amount_to_access" class="token-amount" :controls="false" type="number" placeholder="0"></el-input>
              </div>
            </div>
            <div class="title" style="margin-top:30px;">Chose Tokens</div>
            <div class="intro">Add up to 3 tokens.</div>
            <div class="token-select">
              <el-input v-model="searchValue" @input="search()" class="search-input" placeholder="Search Token or Paste Token Contract" ></el-input>
              <div class="search-list" v-if="showTokenList.length>0">
                <div class="search-item" v-for="item in showTokenList" @click="selectToken(item)">
                  <img class="search-token-icon" :src="item.icon"/>
                  <div class="search-token-symbol txt-wrap">{{item.symbol}}</div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--  NFT -->
      <div :id="'pop-nft'+location" class="nft-check">
        <el-popover placement="bottom-start" trigger="hover">
          <template #reference>
            <div :class="['nft-check-button',postForm.isNft ? 'active' : '']" @click="chooseNft()"></div>
          </template>
          <div class="pop-box pop-intro">
            <div class="title">Post as NFT</div>
            <div class="intro">This post will be minted as an NFT on NEAR protocol and cannot be edited after minting.</div>
          </div>
        </el-popover>
        <div class="pop-nft-mask" v-if="showNftBox" @click.self="showNftBox=false">
          <div class="pop-box pop-intro pop-nft-info">
            <div class="title-box">
              <div class="title">Post as NFT</div>
              <!--
              <a class="more" target="_blank" href="">Find out more</a>
              -->
            </div>
            <div class="intro">This post will be minted as an NFT on NEAR protocol and cannot be edited after minting.</div>
            <div class="title-box mt40">
              <div class="title">Choose your cover</div>
              <div class="cover-type">
                <div :class="['auto-generated', !postForm.nft.cover ? 'active' : '']" @click="postForm.nft.isAutoGenerated=true;postForm.nft.cover = '';">Auto-generated</div>
                <div class="upload-cover" @click="uploadCover">Upload</div>
                <el-upload
                  :id="'upload-cover'+location"
                  class="upload-cover-input"
                  action=""
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  multiple
                  :show-file-list="false"
                  list-type="picture-card"
                  :http-request="uploadCov"
                  :before-upload="beforeUpload"
                  >
                </el-upload>
              </div>
            </div>
            <div class="cover-preview">
              <img v-if="postForm.nft.cover" :src="postForm.nft.cover"/>
              <img v-else :src="postForm.nft.defalutCover"/>
            </div>
            <div class="title mt40">Public offering</div>
            <div class="intro" v-if="postForm.nft.isPublicSale">Public offering gives you the option to set the 
quantity and price of your NFTs, which can then be sold on the market.</div>
            <div class="intro" v-else>Non-public offering means this post will be minted as an NFT and stored in your wallet.</div>
            <div :class="['btn-sale',postForm.nft.isPublicSale ? 'open' : '']" @click="postForm.nft.isPublicSale = !postForm.nft.isPublicSale"></div>
            <div class="sale-info" v-if="postForm.nft.isPublicSale">
              <div class="sale-item">
                <div>copies</div>
                <el-input min=1 step=1 :controls="false" type="number" v-model="postForm.nft.copies" />
              </div>
              <div class="sale-item sale-price">
                <div>mint price</div>
                <el-input :min="0" :controls="false" type="number" v-model="postForm.nft.mintPrice" />
              </div>
            </div>
            <div class="button-border button-post-nft">
              <div class="button" @click="postNft()">Mint</div>
            </div>

          </div>
          <!-- Canvas -->
          <Canvas :text="postForm.text" @setDefalutCover="setDefalutCover"/>
        </div>
      </div>

      <!-- post button -->
      <div :id="'pop-notice'+location" :class="['mini-button-border','button-post',!postForm.text.trim() && postForm.imgs.length<=0 ?'disabled' : '']">
        <div :id="'pop-button'+location" class="mini-button" @click="post()">Post</div>
        <!-- post notice -->
        <div class="pop-box pop-intro pop-notice" v-if="showNotice">
          <div class="title">Notice</div>
          <div class="intro">This action will be recorded as a transaction on Near Protocol, details can be verify on [Recent activity (<a href="https://wallet.testnet.near.org/" target="_blank">https://wallet.testnet.near.org/ </a>) ]</div>
          <div class="button-box">
            <div class="mini-button-border button-cancle" @click="showNotice=false">
              <div class="mini-button">Cancle</div>
            </div>
            <div class="mini-button-border" @click="confirmPost()">
              <div class="mini-button">Confirm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Preview -->
  <template v-if="showPreview">
    <ImagePreview :imgs="postForm.imgs" :index="index"  @closePreview = "closePreview" ></ImagePreview>
  </template>

  <!-- login-mask -->
  <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
</template>

<script>
  import { ref, reactive, toRefs , getCurrentInstance, nextTick } from "vue";
  import { useStore } from 'vuex';
  import { useRouter } from "vue-router";
  import MainContract from "@/contract/MainContract";
  import NftContract from "@/contract/NftContract";
  import CommunityContract from "@/contract/CommunityContract";
  import EncryptionContract from "@/contract/EncryptionContract";
  import { getMetadata } from "@/contract/TokenContract.js";
  import { executeMultipleTransactions, generateAccessKey } from '../utils/transaction';
  import { parseAmount,getParam,generatePhrase } from '@/utils/util';
  import { upload } from "@/utils/upload.js";
  import { popularToken } from '@/utils/tokenData.js';
  import * as StackBlur from 'stackblur-canvas';
  import LoginMask from "@/component/login-mask.vue";
  import DiscordPicker from 'vue3-discordpicker';
  import ImagePreview from '@/component/image-preview.vue';
  import UserPopup from '@/component/user-popup.vue';
  import Canvas from '@/component/canvas.vue';
  import * as nearAPI from 'near-api-js';
  import js_sha256 from 'js-sha256';
  export default {
    components: {
      LoginMask,
      DiscordPicker,
      ImagePreview,
      UserPopup,
      Canvas
    },
    props:{
      location:{
        type:String,
        value:""
      },
      community:{
        type:Object,
        value:{}
      },
    },
    setup(props,{ emit }) {
      const store = useStore();
      const router = useRouter();
      const { proxy } = getCurrentInstance();
      const mainContract = new MainContract(store.state.account);
      const nftContract = new NftContract(store.state.account);
      const encryptionContract = new EncryptionContract(store.state.account);

      //state
      const state = reactive({
        postForm: {
          text: "",
          imgs: [],
          blur_imgs:[],
          community:{
            communityId:"",
            name:"",
            avatar:""
          },
          isPrivate:false,
          access:[],
          isNft:false,
          nft:{
            isAutoGenerated:true,
            defalutCover:"",
            defalutCoverFile:null,
            cover:"",
            coverBase64:"",
            isPublicSale:false,
            mintPrice:10,
            copies:1000,
          }
        },
        defaultCommunity:{},
        focusNode:null,
        focusOffset:null,
        start_index:null,
        end_index:null,
        isLoaingUserList:false,
        showUserList:false,
        userList:[],
        //community
        joinedCommunities:[],
        showCommunity:false,
        //token
        showTokenBox:false,
        searchValue:'',
        searchTokenList:[],
        defaultTokenList:[],
        showTokenList:[],
        //nft
        showNftBox:false,
        //image preview
        showPreview:false,
        index:0,
        //other
        showLogin:false,
        showNotice:false,
      })

      const init = async () => {
        //usedTokenList
        const usedTokenList = JSON.parse(localStorage.getItem("usedTokenList")) || [];
        //defaultTokenList
        const tokenList = [...popularToken];
        state.defaultTokenList = tokenList.slice(0,9);
        //showTokenList & searchTokenList
        state.searchTokenList = deduplication(usedTokenList.concat(state.defaultTokenList));
        state.defaultTokenList = state.searchTokenList;
        state.showTokenList = state.searchTokenList.slice(0,9);
        //community
        if(props.community){
          state.postForm.community = props.community
        }else{
          const res = await proxy.$axios.community.get_community_detail({
            accountId:"",
            communityId: store.state.nearConfig.MAIN_CONTRACT,
          });
          if(res.success) {
            state.defaultCommunity = {
              avatar:res.data.avatar,
              communityId:res.data.communityId,
              name:res.data.name
            }
            state.postForm.community = state.defaultCommunity;
          }
        }
        //nft set
        if(localStorage.getItem('nftSetting')){
          const nftInfo = JSON.parse(localStorage.getItem("nftSetting"));
          state.postForm.nft.copies = nftInfo.copies;
          state.postForm.nft.mintPrice = nftInfo.mint_price;
        }
      }

      //@
      const onFocus = () => {
        if(checkLogin()){
          postInput.value.focus();
          if(document.support){
            var range = document.selection.createRange();
            this.last = range;
            range.moveToElementText(el);
            range.select();
            document.selection.empty();
          } else {
            var range = document.createRange();
            range.selectNodeContents(postInput.value);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
      const onCheck = (e) => {
        if(postInput.value.textContent.length>=1000){
          e.preventDefault();
        }
      }

      const onClick = () => {
        const selection = window.getSelection()
        state.focusNode = selection.focusNode;
        state.focusOffset = selection.focusOffset;
        state.start_index = selection.focusOffset;
        console.log(state.focusNode,state.focusOffset,state.start_index);
      }
      const onChange = async (e) => {
        const selection = window.getSelection()
        const text = selection.extentNode.nodeValue;
        state.postForm.text = postInput.value.textContent;
        state.focusNode = selection.focusNode;
        state.focusOffset = selection.focusOffset;
        let start = Math.max(selection.focusOffset-21,0);
        let start_index = null;
        
        let str = "";

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

      // const popUser = ref(null);
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
              list.push({account_id:res.data[i]['account_id'],outer:true});
            }
          }
          state.userList = list;
          state.isLoaingUserList = false;
        }
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
      const debounceInput = debounce(searchUser, 300)

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
        state.showUserList = false;
      }






      //checkLogin
      const postInput = ref();
      const checkLogin = () => {
        if(!store.getters.isLogin){
          postInput.value.blur();
          state.showLogin = true;
          return false;
        }else{
          return true;
        }
      }
      
      // image upload
      const stateData = reactive({
        imgList:[],
        count:0,
      })
      const uploadImage = () => {
        if(checkLogin()){
          const elUploadInput = document.getElementById('upload-image'+props.location).getElementsByClassName('el-upload__input')[0];
          elUploadInput.click();
        }
      }
      const beforeUpload = (file,fileList) => {
        stateData.count++;
        if (file.size > 1024 * 1024 * 10) {// maxSize = 10M
            proxy.$Message({
              message: "The maximum size is 10M",
              type: "error",
            });
            return false
        }
        return file
      }
      const uploadImg = ({ file }) => {
        //count check
        let inx = -1;
        if(stateData.imgList.length >= 9){
          stateData.count--;
          proxy.$Message({
            message: "You can upload up to 9 photos",
            type: "error",
          });
          return false
        }
        inx = stateData.imgList.length;
        stateData.imgList[inx] = '';

        //upload
        upload(file).then(data=>{
          stateData.count--;
          state.postForm.imgs[inx] = data;
        })
      }
      const handleRemove = (index) => {
        stateData.imgList.splice(index,1);
        state.postForm.imgs.splice(index,1);
      }

      //image preview
      const imagePreview = (index) => {
        state.index = index;
        state.showPreview =true;
      }
      const closePreview = () => {
        state.showPreview =false;
      }

      //emoji
      const setEmoji = (emoji) => {
        if(checkLogin()){
          if(postInput.value.textContent && state.focusNode){
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            console.log(state.focusNode,state.start_index);
            const container = state.focusNode; 
            const pos = state.start_index;
            //insert
            range = document.createRange(); 
            var cons = window.document.createTextNode(emoji); 
            container.insertData(pos, cons.nodeValue); 
            range.setEnd(container, pos + cons.nodeValue.length); 
            range.setStart(container, pos + cons.nodeValue.length); 
            state.start_index = pos + cons.nodeValue.length;

            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }else{
            postInput.value.innerHTML = postInput.value.innerHTML + emoji;
          }
          state.postForm.text = postInput.value.textContent;

          // selection.addRange(range); 
          // selection.collapseToEnd();
        }
      }
      const setGif = (gif) => {
        state.postForm.text = state.postForm.text + emoji;
      }

      //showCommunityBox
      const showCommunityBox = async () => {
        if(checkLogin()){
          const res = await proxy.$axios.community.get_joined_community_list({
            accountId:store.getters.accountId,
            page:0,
            limit:10000
          });
          if(res.success) {
            //usedTokenList
            const usedCommunities = JSON.parse(localStorage.getItem("usedCommunities")) || [];
            state.joinedCommunities =  deduplication(usedCommunities.concat(res.data),'community');
          }
          state.showCommunity = !state.showCommunity;
        }
      }
      const selectCommunity = (item) => {
        if(state.postForm.community.communityId != item.communityId){
          state.postForm.community= {
            communityId:item.communityId,
            avatar:item.avatar,
            name:item.name || item.communityId
          }
          state.showCommunity = false;
          //usedCommunities
          let usedCommunities = JSON.parse(localStorage.getItem("usedCommunities")) || [];
          usedCommunities.unshift(item);
          usedCommunities = deduplication(usedCommunities,'community');
          localStorage.setItem("usedCommunities",JSON.stringify(usedCommunities))
        }else{
          state.postForm.community= {
            communityId:"",
            avatar:"",
            name:""
          }
          state.showCommunity = false;
        }
      }

      //choose type
      const chooseType = () => {
        if(checkLogin()){
          state.postForm.isPrivate = true;
          state.showTokenBox = !state.showTokenBox;
          // if(!state.postForm.isPublic){
          //   state.showTokenBox = true;
          // }else{
          //   state.showTokenBox = false;
          // }
        }
      }
      const search = async () => {
        const str = state.searchValue;
        if(str){
          state.showTokenList = [];
          const metadata = await getMetadata(str);
          if(metadata){ //contract serach
            metadata.tokenId = state.searchValue;
            state.showTokenList = [metadata];
          }else{//name|symbol search
            const list = []
            state.searchTokenList.forEach(item=>{
              if(item.symbol.indexOf(str)>-1 || item.name.indexOf(str)>-1 || item.tokenId == str){
                list.push(item);
              }
            });
            state.showTokenList = mysort(list,str);
          }
        }else{
          state.showTokenList = state.defaultTokenList;
        }
      }
      const mysort = (list,str) => {
        let len=list.length;
        let tmp = '';
        for(let i=0;i<len;i++){
          for(let j=i+1;j<len;j++){
            if(list[i]['symbol'].localeCompare(list[j]['symbol'])>0){
              tmp=list[i];
              list[i]=list[j];
              list[j]=tmp;
            }
          }
        }
        list.sort(function(a,b) {
          return a.symbol.indexOf(str) - b.symbol.indexOf(str);
        })
        return list;
      }
      const selectToken = (item) => {
        //check count
        if(state.postForm.access.length>=3){
            proxy.$Message({
                message: "Only add up to 3 tokens",
                type: "error",
            });
            return false;
        }
        //check isSelected
        let has_selected = false;
        state.postForm.access.forEach(token=>{
            if(token.tokenId == item.tokenId){
                has_selected = true;
            }
        });
        if(!has_selected){
          state.postForm.access.push(item);
          state.searchValue = "";
          //usedTokenList
          let usedTokenList = JSON.parse(localStorage.getItem("usedTokenList")) || [];
          usedTokenList.unshift(item)
          usedTokenList = deduplication(usedTokenList);
          localStorage.setItem("usedTokenList",JSON.stringify(usedTokenList));
          // showTokenList
          state.showTokenList = deduplication(usedTokenList.concat(state.defaultTokenList)).slice(0,9);

        }
      }
      const deleteToken = (inx) => {
        state.postForm.access.splice(inx,1);
      }

      const deduplication = (list,type) => {
        const ids = [];
        const res = [];
        list.forEach(item=>{
          if(type=='community'){
            if(ids.indexOf(item.communityId) == -1){
              res.push(item);
              ids.push(item.communityId);
            }
          }else{
            if(ids.indexOf(item.tokenId) == -1){
              res.push(item);
              ids.push(item.tokenId);
            }
          }
        })
        return res;
      }


      //choose Nft
      const chooseNft = () => {
        if(checkLogin()){
          state.postForm.isNft = !state.postForm.isNft;
        }
      }
      const uploadCover = () => {
        if(checkLogin()){
          state.postForm.nft.isAutoGenerated=false;
          const elUploadInput = document.getElementById('upload-cover'+props.location).getElementsByClassName('el-upload__input')[0];
          elUploadInput.click();
        }
      }
      const uploadCov = ({ file }) => {
        //upload
        fileByBase64(file)
        upload(file).then(data=>{
          state.postForm.nft.cover = data;
        })
      }
      const fileByBase64 = (file) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
          state.postForm.nft.coverBase64 = e.target.result
        };
      }
      const setDefalutCover = (obj) => {
        // fileByBase64(obj.file)
        state.postForm.nft.defalutCover = obj.url;
        state.postForm.nft.defalutCoverFile = obj.file;
      }



      //start blurImg 
      const handleBlur = async () => {
        const imglist = state.postForm.imgs;
        for(let i = 0;i<imglist.length;i++){
          await blurImg(imglist[i],i);  //url => canvas
          const file = getImageFileFromCanvas(i);   //canvas  to  file
          const data =  await upload(file);  // file upload
          state.postForm.blur_imgs[i]=data;
        }
      }
      //url => canvas
      const blurImg = (url,index) => {
        return new Promise((resolve,reject)=>{
          const canvas = document.createElement('canvas')
          canvas.id = "canvas"+props.location+index;
          canvas.width = 300;
          canvas.height = 200;
          canvas.style.display = "none"
          document.getElementById('post'+props.location).appendChild(canvas);

          const img = document.createElement('img')
          img.id = "blurimg"+props.location+index;
          img.src = url + '?' + new Date().getTime();
          img.setAttribute('crossOrigin', '')
          img.style.display = "none"
          document.getElementById('post'+props.location).appendChild(img);
          img.onload = function() {
            StackBlur.image("blurimg"+props.location+index, "canvas"+props.location+index,90); 
            resolve();  
          }
        })
      }
      //canvas  to  file
      const getImageFileFromCanvas = (index) => {
        const canvas = document.getElementById('canvas'+props.location+index)
        canvas.crossOrigin = "Anonymous";
        const ctx = canvas.getContext('2d')
        var dataurl = canvas.toDataURL('image/jpg');
        
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], '1.jpg', {type: mime});
        return file;
      }

      //post
      const post = async () => {
        if((!state.postForm.text && state.postForm.imgs.length<=0) || !checkLogin()){
          return;
        }
        if(state.postForm.isNft){
          state.showNftBox = true;
          return;
        }
        //checkAccess
        if(!checkAccess()){
          proxy.$Message({
            message: "Amount of tokens cannot be empty",
            type: "error",
          });
          return;
        }
        //notice
        if(!localStorage.getItem("postAlerted")){
          state.showNotice = true;
          return;
        }
        proxy.$Loading.showLoading({title: "Loading"});
        if(state.postForm.access.length>0){
          await handleBlur();
          await encryptPost();
        }else{
          await publicPost();
        }
      }

      const publicPost = async () => {
        const options = [];
        if(postInput.value.innerHTML){
          const reg = RegExp(/<span[^>]*>([\s\S]*?)<\/span>/,"g");
          let r= '';
          while ((r= reg.exec(postInput.value.innerHTML)) != null) {
            options.push({At:r[1].trim().substring(1)});
          }
        }
        const params = {   
          args:JSON.stringify({
            text:postInput.value.innerHTML,
            imgs:state.postForm.imgs,
            options
          }), 
        }
        let result = {}
        if(state.postForm.community.communityId == store.state.nearConfig.MAIN_CONTRACT){
          result = await mainContract.addPost(params,store.state.account);
        }else{
          const communityContract = await CommunityContract.new(state.postForm.community.communityId);
          result = await communityContract.addPost(params, state.postForm.community.communityId);
        }
        handleSuccess(result);
      }

      const encryptPost = async (param) => {
        //encrypt
        // const conditions = [{
        //   FTCondition:{
        //     token_id:'33.token.bhc8521.testnet',
        //     amount_to_access:parseAmount(1,24)
        //   }
        // }]
        const access = {
          relationship: "Or",
          conditions:[]
        }
        for(let i=0;i<state.postForm.access.length;i++){
          const item = state.postForm.access[i];
          let decimals = item.decimals || 24;
          if(item.tokenId && item.tokenId != "near" && !item.decimals){
            const metadata = await getMetadata(item.tokenId);
            decimals = metadata.decimals;
          }
          access.conditions.push({
            FTCondition:{
              token_id:item.tokenId,
              amount_to_access:parseAmount(item.amount_to_access,decimals)
            }
          })
        }
        //encrypt
        const param1 = {
          plain_text:{
            text:postInput.value.innerHTML,
            imgs:JSON.stringify({...state.postForm.imgs}),
          },
          contract_id:state.postForm.community.communityId,
        }
        const res = await encryptionContract.encrypt(param1);
        // addEncryptPost
        const param2 = {
          encrypt_args:JSON.stringify(res.cipher_text),
          access,
          text_sign:res.text_sign,
          contract_id_sign:res.contract_id_sign,
          blur_imgs:state.postForm.blur_imgs
        }
        let result = {}
        if(state.postForm.community.communityId == store.state.nearConfig.MAIN_CONTRACT){
          result = await mainContract.addEncryptPost(param2,store.state.account);
        }else{
          const communityContract = await CommunityContract.new(state.postForm.community.communityId);
          // const communityContract = new CommunityContract(store.state.account,state.postForm.community.communityId);
          result = await communityContract.addEncryptPost(param2,store.state.account,state.postForm.community.communityId);
        }
        handleSuccess(result);
      }

      const checkAccess = () => {
        if(state.postForm.access.length>0){
          for(let i=0;i<state.postForm.access.length;i++){
            const item = state.postForm.access[i];
            if(!item.amount_to_access || item.amount_to_access<=0){
              return false;
              break;
            }
          }
          return true;
        }else{
          return true;
        }
      }

      const confirmPost = () => {
        state.showNotice = false;
        localStorage.setItem("postAlerted",true)
        post();
      }



      //postNft
      const postNft = async () => {
        //check 
        if((!state.postForm.text && state.postForm.imgs.length<=0) || !checkLogin()){
          return;
        }
        //check Nft Info
        if(state.postForm.nft.isPublicSale && (!state.postForm.nft.copies || state.postForm.nft.copies<1 || state.postForm.nft.copies%1 !== 0)){
          proxy.$Message({
            message: "Minimum copyies is 1",
            type: "error",
          });
          return;
        }
        if(state.postForm.nft.isPublicSale && (!state.postForm.nft.mintPrice || !state.postForm.nft.mintPrice < 0)){
          proxy.$Message({
            message: "Minimum mint price is 0",
            type: "error",
          });
          return;
        }

        proxy.$Loading.showLoading({title: "Loading"});


        //cover
        let cover = state.postForm.nft.isAutoGenerated ? "" : state.postForm.nft.cover;
        let coverBase64 = state.postForm.nft.isAutoGenerated ?  state.postForm.nft.defalutCover : state.postForm.nft.coverBase64;
        if(state.postForm.nft.isAutoGenerated){
          const data = await upload(state.postForm.nft.defalutCoverFile);
          cover = data;
        }

        //record param
        if(state.postForm.nft.isPublicSale){
          localStorage.setItem('nftSetting',JSON.stringify({
            mint_price:state.postForm.nft.mintPrice,
            copies:Number(state.postForm.nft.copies)
          }))
        }


        //create
        const params = {
          creator_id: store.getters.accountId,
          token_metadata: {
            title: "popula",
            description: postInput.value.innerHTML,
            media: cover,
            media_hash: js_sha256.sha256(coverBase64),
            copies:state.postForm.nft.isPublicSale ? Number(state.postForm.nft.copies) : 1,
            extra:JSON.stringify({...state.postForm.imgs})
          },
          mint_price: state.postForm.nft.isPublicSale ? parseAmount(state.postForm.nft.mintPrice,24) : null, 
          ft_token_id: "near", 
          notify_contract_id: store.state.nearConfig.MAIN_CONTRACT
        }

        let deposit = state.postForm.nft.isPublicSale ? '20000000000000000000000' : '40000000000000000000000';
        const result = await nftContract.nftCreateSeries(params,deposit);
      }


      //handleSuccess
      const handleSuccess = (res) => {
        state.postForm = {
          text: "",
          imgs: [],
          blur_imgs:[],
          community:state.defaultCommunity,
          isPrivate:false,
          access:[],
          nft:{
            isAutoGenerated:true,
            defalutCover:"",
            cover:"",
            coverBase64:"",
            isPublicSale:false,
            mintPrice:10,
            copies:1000,
            
          }
        };
        postInput.value.innerHTML = "";
        proxy.$Loading.hideLoading();
        if (res) {
          proxy.$Message({
            message: "Post Success",
            type: "success",
          });
          setTimeout(()=>{
            emit("postSuccess");
          },500)
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

      //redirectPage
      const redirectPage = (path,need_login=true) => {
        if(!store.getters.isLogin && need_login){
          state.showLogin = true
        }else{
          router.push(path);
        }
      };

      return {
        ...toRefs(state),
        // popUser,
        init,
        onCheck,
        onFocus,
        onClick,
        onChange,
        onSelectSubmit,
        postInput,
        checkLogin,
        uploadImage,
        beforeUpload,
        uploadImg,
        handleRemove,
        imagePreview,
        closePreview,
        setEmoji,
        setGif,
        showCommunityBox,
        selectCommunity,
        chooseType,
        search,
        selectToken,
        deleteToken,
        chooseNft,
        uploadCover,
        uploadCov,
        setDefalutCover,
        post,
        postNft,
        confirmPost,
        showLoginMask,
        closeLoginMask,
        redirectPage,
      };
    },
    mounted(){
      this.init();

      document.addEventListener('click',(e) => {
        const pop_notice = document.getElementById('pop-notice'+this.location);
        if(this.showNotice && pop_notice &&　!pop_notice.contains(e.target)) {
            this.showNotice = false;
        }

        const pop_community = document.getElementById('pop-community'+this.location);
        if(this.showCommunity && pop_community &&　!pop_community.contains(e.target)) {
            this.showCommunity = false;
        }

        const pop_token = document.getElementById('pop-token'+this.location);
        if(this.showTokenBox && pop_token &&　!pop_token.contains(e.target)) {
            this.showTokenBox = false;
        }

        // const pop_nft = document.getElementById('pop-nft'+this.location);
        // // const pop_btn = document.getElementById('pop-button'+this.location);
        // if(this.showNftBox && ((pop_nft &&　!pop_nft.contains(e.target)) || (pop_notice &&　!pop_notice.contains(e.target)))) {
        //     console.log("hhhhhhhh");
        //     this.showNftBox = false;
        // }

        const pop_user = document.getElementById('pop-user'+this.location);
        if(this.showUserList && pop_user &&　!pop_user.contains(e.target)) {
            this.showUserList = false;
        }

      })
    },

  }
</script>

<style lang="scss" scoped>
  .post{
    width:690px;
    padding:20px;
    background: #28282D;
    border-radius: 24px;
    position:relative;
    :deep(.el-upload) {
      display:none;
    }
    &#postsuspend{
      width:696px;
      .postForm{
        max-height:50vh;
        overflow-y:scroll;
      }
    }
    .postForm{
      border-radius: 10px;
      background: #36363C;
      padding:20px 20px 20px 20px;
      position:relative;
      .div-input{
        max-height:30vh;
        overflow-y:scroll;
        position:relative;
        z-index:3;
        padding-left:36px;
        background: transparent;
        font-family: D-DINExp;
        font-size: 16px;
        line-height:24px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        border:0;
        text-align:justify;
        -webkit-user-modify: read-write-plaintext-only;
        
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
      :deep(.el-textarea){
        position:static!important;
        height:24px;
        margin-top:34px;
        textarea{
          background: transparent;
          padding:0;
          padding-left:36px;
          font-family: D-DINExp;
          font-size: 16px;
          line-height:24px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          border:0;
          resize:none;
          text-align:justify;
          display:none;
        }
        .el-input__count{
          display:block;
          text-align:right;
          background:transparent;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          /*position:static;*/
          bottom:20px;
          right:20px;
          line-height:16px;
          position:relative;
          top:8px;
          left:0;
        }
      }
      .pop-user-box{
        position:relative;
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
      .avatar{
        width: 24px;
        height: 24px;
        border-radius:50%;
        position:absolute;
        top:20px;
        left:20px;
        object-fit: cover;
      }
      .images{
        display:flex;
        flex-wrap:wrap;
        .image-item{
          width: 180px;
          height: 180px;
          position:relative;
          margin-right:35px;
          margin-top:35px;
          &.mr0{
            margin-right:0;
          }
          .delete-image{
            position:absolute;
            top:-10px;
            right:-10px;
            width: 30px;
            height: 30px;
            background: #28282D url("@/assets/images/common/icon-close-mini.png") no-repeat center center;
            background-size:16px;
            box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.5);
            border-radius:50%;
            cursor: pointer;
          }
          img{
            width: 180px;
            height: 180px;
            border-radius: 10px;
            object-fit: cover;
          }
        }
      }
      .img-emoji-box{
        position:absolute;
        left:20px;
        bottom:20px;
        display:flex;
        .icon-image{
          cursor: pointer;
          margin-right:30px;
          width: 24px;
          height: 24px;
          background:url("@/assets/images/post/icon-image.png") no-repeat center center;
          background-size:24px 24px;
          &:hover{
            background-image:url("@/assets/images/post/icon-image-hover.png");
          }
        }
        .icon-emoji{
          width: 24px;
          height: 24px;
          margin-right:30px;
          cursor: pointer;
          background:url("@/assets/images/post/icon-emoji.png") no-repeat center center;
          background-size:24px 24px;
          &:hover{
            background-image:url("@/assets/images/post/icon-emoji-hover.png"); 
          }
        }
      }
    }
    .edit{
      margin-top:20px;
      height:36px;
      display:flex;
      align-items:center;
      .community-select{
        margin-right:30px;
        position: relative;
        padding: 0 10px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        cursor: pointer;
        .community-selected{
          width: 124px;
          height: 34px;
          line-height: 34px;
          padding-right:22px;
          background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
          background-size:12px 12px;
          display:flex;
          align-items: center;
          font-family: D-DINExp;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          img{
            width: 18px;
            height: 18px;
            border-radius: 4px;
            margin-right:6px;
            object-fit: cover;
          }
        }
        .pop-community-join{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:320px;
          padding:30px;
          .intro{
            color: #FFFFFF;
          }
        }
        .pop-community-select{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:400px;
          padding:30px;
          .joined-list{
            margin-top:4px;
            display:flex;
            flex-wrap:wrap;
            justify-content:space-between;
            .joined-item{
              padding:0 12px;
              margin-top:16px;
              width: 162px;
              height: 50px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 10px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 400;
              display:flex;
              align-items: center;
              &:hover,&.active{
                background: #28282D;
                border: 1px solid #28282D;
              }
              img{
                width: 30px;
                height: 30px;
                border-radius: 8px;
                margin-right:10px;
              }
            }
          }
        }
      }
      .post-type{
        height: 36px;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        font-family: D-DINExp;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        display:flex;
        position:relative;
        >div.type-select{
          padding:0 10px;
          border-radius: 6px;
          line-height: 36px;
          cursor: pointer;
        }
        .token-gated{
          display: flex;
          align-items:center;
          .selected-list{
            margin-left:12px;
            display:flex;
            &.selected-list2{
              width:28px;
            }
            &.selected-list3{
              width:38px;
            }
            .token-icon{
              width: 18px;
              height: 18px;
              // border: 1px solid rgba(215,215,215,1);
              position:relative;
              border-radius: 50%;
              &.token-icon0{
                z-index:3;
              }
              &.token-icon1{
                z-index:2;
                left:-8px;
              }
              &.token-icon2{
                z-index:1;
                left:-16px;
              }
            }
          }
        }
        .pop-token-gated{
          position:absolute;
          top:46px;
          left:0;
          z-index:99;
          width:460px;
          padding:30px;
          .token-selected{
            margin-top:26px;
            display:flex;
            .token-selected-item{
              width: 120px;
              height: 169px;
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 10px;
              display:flex;
              flex-direction:column;
              align-items:center;
              padding:20px 15px;
              position: relative;
              margin-right:20px;
              &:last-child{
                margin-right:0;
              }
              .close{
                width: 30px;
                height: 30px;
                box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.5);
                position:absolute;
                top:-10px;
                right:-10px;
                background: #28282D url("@/assets/images/common/icon-close-mini.png") no-repeat center center;
                background-size:16px 16px;
                border-radius:50%;
              }
              .token-icon{
                width: 40px;
                height: 40px;
                border-radius:50%;
              }
              .token-symbol{
                font-family: D-DINExp-Bold;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                text-align: center;
                font-weight: 700;
                margin-top:12px;
                line-height: 17px;
              }
              :deep(.el-input){
                margin-top:20px;
                input{
                  border:0;
                  outline:0;
                  width: 90px;
                  height: 40px;
                  padding:0 10px;
                  line-height: 40px;
                  background: #28282D;
                  border-radius: 10px;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: center;
                  font-weight: 400;
                  box-sizing:border-box;
                }
              }
            }
          }
          .token-select{
            margin-top:20px;
            background: #28282D;
            border-radius: 6px;
            .search-input{
              margin-left:0;
              width: 100%;
              height: 40px;
              line-height: 38px;
              border-radius: 6px;
              border: 1px solid rgba(255,255,255,0.8);
              :deep(.el-input__inner){
                height: 38px;
                line-height: 38px;
                border-radius: 6px;
                background: transparent;
                border:0;
                outline:0;
                font-family: D-DINExp;
                font-size: 14px;
                color: #FFFFFF;
                font-weight: 400;
                padding:0 20px 0 46px ;
                background:url("@/assets/images/common/icon-search.png") no-repeat 20px center;
                background-size:16px 16px;
              }
            }
            .search-list{
              padding:0 0 20px 20px;
              display:flex;
              flex-wrap:wrap;
              .search-item{
                width:106px;
                margin-top:20px;
                margin-right:20px;
                display:flex;
                align-items: center;
                .search-token-icon{
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                }
                .search-token-symbol{
                  font-family: D-DINExp-Bold;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 700;
                  margin-left:12px;
                  max-width:62px;
                }
              }
            }
          }
          .title{
            line-height: 17px;
          }
        }
      }
      .nft-check{
        margin-left:30px;
        position: relative;
        .nft-check-button{
          width:70px;
          height:30px;
          background:url("@/assets/images/post/btn-nft-close.png") no-repeat;
          background-size:cover;
          cursor: pointer;
          &.active{
            background:url("@/assets/images/post/btn-nft-open.png") no-repeat;
            background-size:cover;
          }
        }
        .pop-nft-mask{
          position: fixed;
          top:0;
          left:0;
          right:0;
          bottom:0;
          background:rgba(0,0,0,0.3);
          z-index:99;
          .pop-nft-info{
            // position: absolute;
            // top:48px;
            // left:0;
            position: absolute;
            top:50%;
            left:50%;
            transform: translate(-50%,-50%);
            z-index:99;
            width:460px;
            padding:30px;
            .mt40{
              margin-top:40px;
            }
            .title-box{
              display: flex;
              justify-content:space-between;
              align-items:center;
              .more{
                padding-right:18px;
                background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
                background-size:14px 14px;
                font-family: D-DINExp;
                font-size: 14px;
                color: #FFFFFF;
                letter-spacing: 0;
                text-align: right;
                font-weight: 400;
                line-height:17px;
              }
              .cover-type{
                display:flex;
                .auto-generated{
                  cursor:pointer;
                  padding-left:24px;
                  background:url("@/assets/images/post/icon-check.png") no-repeat left center;
                  background-size:16px 16px;
                  &.active{
                    background:url("@/assets/images/post/icon-checked.png") no-repeat left center;
                    background-size:16px 16px;
                  }
                }
                .upload-cover{
                  cursor:pointer;
                  margin-left:30px;
                  padding-left:24px;
                  background:url("@/assets/images/post/icon-upload.png") no-repeat left center;
                  background-size:16px 16px;
                }
              }
            }
            .cover-preview{
              margin-top:20px;
              width:400px;
              height:230px;
              background: #0B0B0B;
              border: 1px solid rgba(40,40,40,1);
              border-radius: 10px;
              overflow: hidden;
              img{
                width:400px;
                height:230px;
                object-fit: cover;
              }
            }
            .btn-sale{
              margin-top:16px;
              width:56px;
              height:30px;
              background:url("@/assets/images/post/btn-sale-close.png") no-repeat left center;
              background-size:56px 30px;
              cursor:pointer;
              &.open{
                background:url("@/assets/images/post/btn-sale-open.png") no-repeat left center;
                background-size:56px 30px;
              }
            }
            .sale-info{
              margin-top:20px;
              display:flex;
              justify-content:space-between;
              .sale-item{
                width:192px;
                height:64px;
                padding:0 12px;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                display:flex;
                justify-content:space-between;
                align-items: center;
                &.sale-price{
                  :deep(.el-input){
                    .el-input__inner{
                      padding:0 18px 0 0;
                      background:transparent url("@/assets/images/common/icon-gas.png") no-repeat 78px center;
                      background-size:12px;
                    }
                  }
                }
                :deep(.el-input){
                  width:90px;
                  height:40px;
                  border-radius: 10px;
                  .el-input__inner{
                    background: transparent;
                    border:0;
                    font-family: D-DINExp;
                    font-size: 16px;
                    color: #FFFFFF;
                    letter-spacing: 0;
                    text-align: right;
                    font-weight: 400;
                  }
                }
              }
            }
            .button-post-nft{
              margin:30px auto 0;
            }
          }
        }
      }
      .button-post{
        cursor:pointer;
        position:absolute;
        right:20px;
        .pop-notice{
          position:absolute;
          top:46px;
          left:0;
        }
      }
    }
  }
</style>

