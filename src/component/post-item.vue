<template>
  <div class="post-item-box" v-if="!isBlocked && !hasDelete" :key="item.target_hash">
    <div :class="['post-item',from=='detail' ? 'post-item-detail' : '']" ref="txtBox" @click="redirectPage('/detail/'+item.target_hash,false)">
      <div class="user">
        <!-- community -->
        <template v-if="community.communityId && from!='community' && from!='detail'">
          <el-popover placement="bottom-start"  trigger="hover" >
            <template #reference>
              <div @click.stop="redirectPage('/community-detail/'+community.communityId,false)">
                <img v-if="community.avatar"  class="avatar avatar-community" :src="$store.getters.getAwsImg(community.avatar)" @error.once="$event.target.src=community.avatar">
                <img v-else  class="avatar avatar-community" src="@/assets/images/test/community.png">
              </div>
            </template>
            <template v-if="community.data">
              <CommunityItem :item="community" :from="'popup'"/>
            </template>
          </el-popover>
          <div class="user-info">
            <div class="name  txt-wrap" @click.stop="redirectPage('/community-detail/'+community.communityId,false)">{{community.name}}</div>
            <div class="createtime">
              <div>posted by </div>
              <div class="username" @click.stop="redirectPage('/user-profile/'+user.account_id,false)"><div class="txt-wrap">{{user.name || user.account_id}}</div></div>
              <el-popover placement="bottom-start"  trigger="hover">
                <template #reference>
                  <div class="time">{{time.showTime}}</div>
                </template>
                <div class="pop-box pop-tip">{{time.hoverTime}}</div>
              </el-popover>
            </div> 
          </div>
        </template>

        <!-- user  :fallback-placements="[ 'bottom','left', 'top','right']" -->
        <template v-else>
          <el-popover placement="bottom-start"  trigger="hover" @show="showUser=true" @hide="showUser=false">
            <template #reference>
              <div @click.stop="redirectPage('/user-profile/'+user.account_id,false)">
                <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar"/>
                <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
              </div>
            </template>
            <template v-if="showUser && from!='detail'">
              <UserPopup :account="item.accountId" @login="showLogin=true"/>
            </template>
          </el-popover>
          <div class="user-info">
            <div class="name" @click.stop="redirectPage('/user-profile/'+user.account_id,false)">
              <div class="name-txt txt-wrap" @click.stop="redirectPage('/user-profile/'+user.account_id,false)">{{user.name || user.account_id}}</div>
              <div class="user-flag co" v-if="community.accountId && community.accountId == user.account_id"></div>
            </div>
            <el-popover placement="bottom-start"  trigger="hover">
              <template #reference>
                <div class="createtime">{{time.showTime}}</div>
              </template>
              <div class="pop-box pop-tip">{{time.hoverTime}}</div>
            </el-popover>
          </div>
        </template>

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
      <div v-if="item.type=='encrypt' && !isAccess" class="default-content" @click.stop="redirectPage('/detail/'+item.target_hash,false)">
        This is a Tonken-gated content.
      </div>
      <template v-else>
        <!-- text -->
        <div v-if="text" class="text" @click.stop="redirectPage('/detail/'+item.target_hash,false)">
          <pre v-if="from=='detail'"><div v-html="text"></div></pre>
          <div v-else class="text-ellipsis-wrapper">
            <div ref="textBox" :class="['txt','txt-wrap5',needWrap ? '' : 'hidebtn', showall? 'showall' : '']">
              <!--<pre>{{text}}</pre>-->
              <label class="btn" @click.stop="showall = !showall"></label>
              <pre ref="textDom"><div v-html="text"></div></pre>
            </div>
          </div>

          <!--
          <div v-else-if="text" class="default">
            <img class="text-default" src="@/assets/images/post-item/text-default.png"/>
          </div>
          -->
        </div>
        <!-- images -->
        <div v-if="images.length>0" :class="['images', 'images'+images.length, images.length>=3 ? 'images-multiple' : '']">
          <img class="img" v-for="(img,index) in images" :src="$store.getters.getAwsImg(img)" @error.once="$event.target.src=img" @click.stop="imagePreview(index)">
        </div>
      </template>
      <!-- bottom edit -->
      <div class="info-bottom">
        <div class="info-left">
          <!-- token -->
          <el-popover placement="bottom-start"  trigger="hover" v-if="item.type=='encrypt' && !isChecking">
            <template #reference>
              <div class="bottom-token-list">
                <template v-for="item in access.conditions">
                  <img  :class="['token-icon',item.FTCondition.access ? '' : 'token-icon-gray']" :src="item.FTCondition.icon"/>
                </template>
              </div>
            </template>
            <div class="pop-box pop-intro pop-token-list">
              <div class="token-item" v-for="item in access.conditions">
                <div class="left-info">
                  <img class="token-icon" :src="item.FTCondition.icon"/>
                  <div class="token-symbol">{{item.FTCondition.symbol}}</div>
                </div>
                <div class="right-check">
                  <div class="count">
                    <span :class="[item.FTCondition.access ? '' : 'no-access']">{{item.FTCondition.balance}}</span>
                     / {{item.FTCondition.amount_to_access}}
                  </div>
                  <img v-if="item.FTCondition.access" class="check-status" src="@/assets/images/community/icon-right.png"/>
                  <img v-else class="check-status" src="@/assets/images/community/icon-error.png"/>
                </div>
              </div>
            </div>
          </el-popover>

          <!-- nft -->
          <el-popover v-if="item.type=='nft' && from!='detail'" placement="bottom-start"  trigger="hover" @show="showNftPop=true" @hide="showNftPop=false">
            <template #reference>
              <div class="nft">NFT</div>
            </template>
            <div class="pop-box pop-intro pop-nft-intro" v-if="showNftPop">
              <template v-if="nft.isPublicSale">
                <div :class="['mint-users','mint-users'+nft.collectors.length]" @click.stop="showCollectorList()">
                  <template v-for="(u,index) in nft.collectors">
                    <img v-if="u.avatar" :class="['avatar','avatar'+index]" :src="$store.getters.getAwsImg(u.avatar)" @error.once="$event.target.src=u.avatar" />
                    <img v-else  :class="['avatar','avatar'+index]" src="@/assets/images/common/user-default.png" />
                  </template>
                </div>
                <div class="intro-item">Total sold：<span class="price">{{nft.total}}</span></div>
                <div class="intro-item">Copies：<span>{{nft.supply}}/{{nft.copies}}</span></div>
                <div class="intro-item">Price：<span class="price">{{nft.price}}</span></div>
                <div :class="['button-border','button-mint-nft',nft.supply>=nft.copies?'disabled':'']">
                  <div class="button" @click.stop="mintNft()">Buy now</div>
                </div>
              </template>
              <div v-else class="intro-item" style="margin-bottom:0;">Copies：<span>1</span></div>
            </div>
          </el-popover>

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
                <a  class="txt-wrap" :href="$store.state.nearConfig.explorerUrl+'/transactions/'+item.transaction_hash" target="_blank">{{item.transaction_hash}}</a>
                <img class="icon-copy" @click.stop="triggerCopy(item.transaction_hash)" src="@/assets/images/common/icon-copy.png">
              </div>
            </div>
          </el-popover>

        </div>

        <div class="info-right">
          <el-popover placement="bottom-start"  trigger="hover">
            <template #reference>
              <div class="share">{{shareCount}}</div>
            </template>
            <div class="pop-box pop-edit">
              <div class="pop-edit-item" @click.stop="shareTwitter()">
                <img class="icon16" src="@/assets/images/post-item/icon-twitter-mini.png"/>
                Twitter
              </div>
              <div class="pop-edit-item" @click.stop="triggerCopy(item.target_hash,true)">
                <img class="icon16" src="@/assets/images/post-item/icon-link.png"/>
                Copy link
              </div>
            </div>
          </el-popover>
          
          <div :class="['comment',addCount ? 'add-count' : '']" @click.stop="reply()">
            <template v-if="commentCount">{{commentCount}}</template>
            <template v-else>Reply</template>
          </div>
          <Like :item="like" :type="'post'"/>
        </div>
      </div>

      <!-- nft -->
      <div v-if="item.type=='nft' && from=='detail'" class="detail-nft">
        <div class="nft">NFT</div>
        <template v-if="nft.isPublicSale">
          <div class="intro-item">Total sold：<span class="price">{{nft.total}}</span></div>
          <div :class="['mint-users','mint-users'+nft.collectors.length]" @click.stop="showCollectorList()">
            <template v-for="(u,index) in nft.collectors">
              <img v-if="u.avatar" :class="['avatar','avatar'+index]" :src="$store.getters.getAwsImg(u.avatar)" @error.once="$event.target.src=u.avatar" />
              <img v-else  :class="['avatar','avatar'+index]" src="@/assets/images/common/user-default.png" />
            </template>
          </div>
          <div class="intro-item" style="margin-left:0;">Copies：<span>{{nft.supply}}/{{nft.copies}}</span></div>
          <div class="intro-item">Price：<span class="price">{{nft.price}}</span></div>
          <div :class="['mini-button-border','button-mint-nft',nft.supply>=nft.copies?'disabled':'']">
            <div class="mini-button" @click.stop="mintNft()">Buy now</div>
          </div>
        </template>
        <div v-else class="intro-item">Copies：<span>1</span></div>
      </div>

      <!-- comment -->
      <div class="comment-box" v-if="from!='detail' && showCommentBox">
        <Comment 
          :targetHash="item.target_hash" 
          :parentAccount="user.account_id"
          :communityId="item.receiverId" 
          :postType="item.type"
          :from="'list'"
          :focus="focusComment"
          @comment="comment"
        />
      </div>
    </div>

    <!-- Image Preview -->
    <template v-if="showPreview">
      <ImagePreview :imgs="images" :index="index"  @closePreview = "closePreview" ></ImagePreview>
    </template>

    <!-- Collectors layer -->
    <div class="elastic-layer" v-if="showCollectors && item.type=='nft'" @click="closeCollectorList()">
      <div class="edit-button close" @click.stop="closeCollectorList()"></div>
      <div class="layer-content">
        <div class="elastic-content">
          <div class="title">Collectors</div>
          <div class="loading-box" v-if="isLoadCollectors">
            <img class="white-loading" src="@/assets/images/common/loading.png"/>
          </div>
          <div id="collector-list" class="collector-list" v-else>
            <template v-for="(user,index) in nft.collectorList">
              <el-popover placement="bottom-start"  trigger="hover" @show="user.showUser=true" @hide="user.showUser=false">
                <template #reference>
                  <div :class="['collector-item',index%2==1 ? 'mr0' : '']" @click.stop="redirectPage('/user-profile/'+user.account_id,false)">
                    <img v-if="user.avatar" class="avatar" :src="$store.getters.getAwsImg(user.avatar)" @error.once="$event.target.src=user.avatar" />
                    <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                    <div class="info">
                      <div class="name txt-wrap">{{user.name || user.account_id}}</div>
                      <div class="account txt-wrap">{{user.account_id}}</div>
                    </div>
                    <div class="number txt-wrap"><span>{{user.number}}</span>/{{nft.copies}}</div>
                  </div>
                </template>
                <template v-if="user.showUser">
                  <UserPopup :account="user.account_id" @login="showLogin=true"/>
                </template>
              </el-popover>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- #copy_text  display:none;  -->
    <div :data-clipboard-text="copyText" ref="copy_text"  id="copy_text" @click="handleCopyFun"></div>

    <!-- login-mask -->
    <login-mask :showLogin="showLogin"  @closeloginmask = "closeLoginMask"></login-mask>
  </div>
</template>

<script>
import { ref, reactive, toRefs , nextTick, watch, computed, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import NftContract from "@/contract/NftContract";
import CommunityContract from "@/contract/CommunityContract";
import { formatAmount, parseAmount, checkCondition, getTimer} from "@/utils/util.js";
import Clipboard from 'clipboard';
import CommunityItem from '@/component/community-item.vue';
import UserPopup from '@/component/user-popup.vue';
import ImagePreview from '@/component/image-preview.vue';
import Like from "@/component/like.vue";
import LoginMask from "@/component/login-mask.vue";
import Comment from '@/component/comment.vue';
import BN from 'bn.js';
import * as bs58 from 'bs58';
export default {
  components: {
    CommunityItem,
    UserPopup,
    ImagePreview,
    Like,
    LoginMask,
    Comment
  },
  props:{
    from:{
      type:String,
      value:''
    },
    item:{
      type:Object,
      value:{}
    },
    commentC:{
      type:Number,
      value:0
    },
    searchWord:{
      type:String,
      value:""
    },
  },
  setup(props,{ emit }) {
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const mainContract = new MainContract(store.state.account);
    const nftContract = new NftContract(store.state.account);

    //state
    const state = reactive({
      //access
      isAccess:false,
      access:[],
      //community
      community:{},
      //user
      user:{},
      showUser:false,
      //time
      time:{
        showTime:"",
        hoverTime:""
      },
      //nft
      token_series_id:props.item.type == 'nft' ? props.item.token_series_id : '',
      nft:{
        total:0,
        supply:0,
        copies:1,
        price:0,
        collectors:[],
        collectorList:[]
      },
      showNftPop:false,
      showCollectors:false,
      isLoadCollectors:false,
      isEndCollectors:false,
      //text
      text: props.item.type == 'nft' ? '' : props.item.text,
      needWrap:true,
      //images
      images: props.item.type=="nft" ? [] : props.item.imgs ,
      // blur_imgs:props.item.blur_imgs || [],
      index:0,
      showPreview:false,
      //gas
      gasUsed:formatAmount(props.item.gas_used,24,4),
      //share & like & comment
      shareCount:props.item.data.shareCount,
      like:{
        likeCount:props.item.data.likeCount,
        isLiked:props.item.data.isLike,
        targetHash:props.item.target_hash,
        accountId:props.item.accountId,
        communityId:(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT) ? "" : props.item.receiverId
      },
      //comment
      commentCount:props.item.data.commentCount,
      showCommentBox:false,
      addCount:false,
      //other

      copyText:"",
      showall:false,
      showLogin:false,
      isBlocked:true,
      isChecking:true,
      focusComment:false,
      isInit:true,
      hasDelete:false,
    })

    watch(
      () => props.commentC,
			() => {
        if(state.isInit){
          state.isInit = false;
          return;
        }
        state.addCount = true;
        setTimeout(()=>{
          state.addCount = false;
          state.commentCount = props.commentC;
        },500)
			}
		)

    const init = async() => {
      
      //filter blockList
      if(isInBlockList()) return;
      state.isBlocked = false;

      //text 
      if(props.searchWord){
        const reg = RegExp(props.searchWord,"ig");
        state.text = state.text.replace(/<\/?.+?>/g, "").replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`)
        // state.text = state.text.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`)
      }

      //time
      state.time = getTimer(props.item.createAt)
      //detail
      const res = await proxy.$axios.post.get_post_detail({
        postId:props.item.target_hash,
        accountId:store.getters.accountId || ''
      });
      if(res.success){
        state.user = res.data.user;
        // state.user.joinedCommunities = res.data.JoinedCommunities.slice(0,3);
        state.community = res.data.postCommunity;
      }
      //access
      if(props.item.type=='encrypt'){
        checkAccess();
      }else{
        state.isChecking = false
      }

      //nft
      if(props.item.type=='nft'){ //&& props.from=='detail'
        await initNft();
      }
    }

    const initNft = async () => {
      if(!state.token_series_id){return;}
      const nft_info = await nftContract.getSeries({token_series_id:state.token_series_id});
      const supply = await nftContract.getSupply({token_series_id:state.token_series_id});
      const price = nft_info.mint_price ? formatAmount(nft_info.mint_price,24,4) : 0;
      state.text = nft_info.metadata.description;
      
      state.images = (nft_info.metadata.extra) ? Object.values(JSON.parse(nft_info.metadata.extra)) : [];
      state.nft = {
        total:price*supply,
        supply:supply,
        copies:nft_info.metadata.copies,
        price:price,
        isPublicSale: nft_info.mint_price===null ? false : true,
        collectors:[],
        collectorList:[]
      }
      state.nft.collectors = await getCollectors('0',3);
    }

    const getCollectors = async (index,limit) => {
      try{
        const tokens = await nftContract.getTokens({token_series_id:state.token_series_id,from_index:index,limit:limit});
        if(tokens.length==0){
          state.isEndCollectors = true;
        }
        const userList = [];
        for(let i = 0;i<tokens.length;i++){
          const user = await proxy.$axios.profile.get_user_info({
            accountId:tokens[i]['owner_id'],
            currentAccountId: store.getters.accountId || ''
          });
          userList.push({...user.data,number:tokens[i]['token_id'].split(':')[1]});
        }
        state.isLoadCollectors = false;
        return userList;
      }catch(e){
        state.isLoadCollectors = false;
        return [];
      }
    }

    //collector-list
    const showCollectorList  = async () => {
      document.getElementsByTagName('body')[0].classList.add("fixed");
      state.showNftPop = false;
      state.showCollectors = true;
      state.isLoadCollectors = true;
      state.nft.collectorList = await getCollectors('0',20);
    }
    const closeCollectorList = () => {
      document.getElementsByTagName('body')[0].classList.remove("fixed");
      state.showCollectors = false;
    }
    //handleScroll
    const handleScroll = async () => {
      if(((document.documentElement.scrollTop + window.innerHeight) >= document.body.scrollHeight-200) && !state.isLoadCollectors && !state.isEndCollectors){
        const res = await getCollectors(state.nft.collectorList.length.toString(),20);;
        state.nft.collectorList = state.nft.collectorList.concat(res);
      }
    }

    const checkAccess = async () => {
      const check_result = await checkCondition(props.item.access);
      state.access = check_result.access;
      if(check_result.is_access || store.getters.accountId==props.item.accountId){
        //comment
        emit("changeAccess");
        //decrypt
        const res = await proxy.$axios.post.get_decode_content({
          postId:props.item.target_hash,
          accountId:store.getters.accountId || ''
        });
        if(res.success){
          state.text = res.data.text;
          if(props.searchWord){
            const reg = RegExp(props.searchWord,"ig");
            state.text = state.text.replace(reg,`<span style='color: #FFD23C;'>${props.searchWord}</span>`)
          }
          state.images = res.data.imgs;
          state.isAccess = true;
        }
      }
      state.isChecking = false
    }

    const isInBlockList = () => {
        const postBlockList = JSON.parse(localStorage.getItem("postBlockList")) || [];
        let isBlocked = false;
        postBlockList.forEach(item=>{
          if(item==props.item.target_hash){isBlocked = true;}
        })
        if(isBlocked){
          return true;
        }
        return false;
    }

    //text wrap
    const textBox = ref()
    const textDom = ref()
    watch(
      () => textDom.value,
      (newVal) => {
        if(!textBox || !textDom || !textBox.value || !textDom.value){return;}
        const textBoxHeight = textBox.value.getBoundingClientRect().height;
        const textDomHeight = textDom.value.getBoundingClientRect().height
        if(textBoxHeight>textDomHeight){
          state.needWrap = false;
        }else{
          state.needWrap = true;
        }
      }
    )

    //getToken
    const getToken = (token_id) => {
      if(checkLogin()){
        
      }
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

    const shareTwitter = () => {
      shareRecord();
      window.open('https://twitter.com/intent/tweet?text='+getShareLink());
    }
    

    //comment
    const comment = (res) => {
      state.showCommentBox = false;
      state.addCount = true;
      setTimeout(()=>{
        state.addCount = false;
        state.commentCount += 1;
      },500)
    }

    const reply = () => {
      if(checkLogin()){
        if(props.item.type=='encrypt' && !state.isAccess){
          proxy.$Message({message: "You do not have permission to comment on the current post"});
          return;
        }
        //post List
        state.focusComment = true;
        state.showCommentBox=!state.showCommentBox;

        //postDetail
        emit("focus");
      }
    }

    //preview
    const imagePreview = (index) => {
      state.index = index;
      state.showPreview =true;
      document.getElementsByTagName('body')[0].classList.add("fixed");
    }
    const closePreview = () => {
      state.showPreview =false;
      document.getElementsByTagName('body')[0].classList.remove("fixed");
    }

    //ShareLink 
    const getShareLink = () => {
      const parmsJson = JSON.stringify({
        type:'content',
        args:{
          hierarchies:[{target_hash:props.item.target_hash,account_id : props.item.accountId}],
          inviter_id:store.getters.accountId || '',
          contract_id: props.item.receiverId
        }
      })
      const signature = bs58.encode(Buffer.from(parmsJson));
      return `${window.location.protocol}//${window.location.host}/share/${signature}`;
    }

    const shareRecord = () => {
      if(checkLogin()){
        const params = {hierarchies:[{target_hash:props.item.target_hash,account_id : props.item.accountId}]};
        const check_params = {
          ...params,
          // inviter_id: store.getters.accountId,
          account_id: store.getters.accountId,
        }
        if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
          store.state.viewAccount.viewFunction(store.state.nearConfig.MAIN_CONTRACT, "check_shared", check_params).then(check_res => {
            if(!check_res){
              mainContract.share(params).then(res=>{
                if(res){
                  state.shareCount++;
                }
              })
            }
          })
        }else{
          store.state.viewAccount.viewFunction(props.item.receiverId, "check_shared", check_params).then(check_res => {
            if(!check_res){
              CommunityContract.new(props.item.receiverId).then(communityContract=>{
                communityContract.share(params).then(res=>{
                  if(res){
                    state.shareCount++;
                  }
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
      const clipboard = new Clipboard('#copy_text')
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

    //edit
    const del = async () => {
      if(checkLogin()){
        const params= {
          hierarchies : [{
            target_hash : props.item.target_hash,
            account_id : state.user.account_id,
          }]
        };
        try{
          let res = ''
          if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
            res = await mainContract.delContent(params); 
          }else{
            const communityContract = await CommunityContract.new(props.item.receiverId);
            res = await communityContract.delContent(params);
          }
          if (res == true) {
            state.hasDelete = true;
            proxy.$Message({
              message: "delete success",
              type: "success",
            });
          } else  if (res == false) {
            throw new Error('error')
          } else {}
        }catch(e){
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
        const params= {
          hierarchies : [{
            target_hash : props.item.target_hash,
            account_id : state.user.account_id,
          }]
        };
        try{
          let res = ''
          if(props.item.receiverId == store.state.nearConfig.MAIN_CONTRACT || props.item.receiverId == store.state.nearConfig.NFT_CONTRACT){
            res = await mainContract.report(params); 
          }else{
            const communityContract = await CommunityContract.new(props.item.receiverId);
            res = await communityContract.report(params);
          }
          if (res == true) {
            proxy.$Message({
              message: "report success",
              type: "success",
            });
          } else  if (res == false) {
            throw new Error('error')
          } else {}
        }catch(e){
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
        const postBlockList = JSON.parse(localStorage.getItem("postBlockList")) || [];
        let isBlocked = false;
        postBlockList.forEach(item=>{
          if(item==props.item.target_hash){isBlocked = true;}
        })
        if(!isBlocked){
          postBlockList.push(props.item.target_hash);
          localStorage.setItem("postBlockList",JSON.stringify(postBlockList));
        }
        proxy.$Message({type: "success",message: "block success"});
        state.isBlocked = true;
      }
    }

    const mintNft = async () => {
      if(checkLogin()){
        if(state.nft.supply>=state.nft.copies) return;
        const deposit = new BN(parseAmount(state.nft.price)).add(new BN('20000000000000000000000'))
        const params = {
          token_series_id: state.token_series_id, 
          receiver_id: store.getters.accountId
        }
        await nftContract.nftMint(params,deposit)
      }
    }

    return {
      ...toRefs(state),
      textBox,
      textDom,
      init,
      showCollectorList,
      closeCollectorList,
      handleScroll,
      comment,
      reply,
      getToken,
      redirectPage,
      imagePreview,
      closePreview,
      copy_text,
      triggerCopy,
      handleCopyFun,
      showLoginMask,
      closeLoginMask,
      del,
      report,
      block,
      mintNft,
      shareTwitter
    };
  },
  mounted(){
    this.init();
    window.addEventListener('scroll',this.handleScroll);
  }
}
</script>
<style lang="scss" scoped>
  .post-item-box{
    border-top:1px solid rgba(255,255,255,0.1);
    &:first-child{
      border:0;
    }
  }

  .post-item{
    padding:20px 0;
    margin-top:0;
    background: #28282D;
    border-radius: 24px;
    cursor: pointer;
    &.post-item-detail{
      cursor: default;
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
        cursor:pointer;
        object-fit: cover;
        &.avatar-community{
          border-radius: 10px;
        }
      }
      .user-info{
        margin-left:12px;
        max-width:300px;
        .name{
          height:20px;
          display:flex;
          align-items: center;
          font-family: D-DINExp-Bold;
          font-size: 18px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          max-width: 300px;
          line-height:20px;
          .name-txt{
            max-width: 300px;
            font-family: D-DINExp-Bold;
            font-size: 18px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            line-height:20px;
            cursor: pointer;
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
          line-height:16px;
          display:flex;
          align-items: center;
          max-width:300px;
          cursor: pointer;
          .username{
            color: rgba(255,255,255,1);
            display:flex;
            flex: 0 1;
            flex-basis:10px;
            padding:0 4px;
            div.txt-wrap{
              display: block;
              max-width:150px;
            }
          }
          .time{
            display:block;
            flex:1;
          }
        }
      }
      .icon-edit{
        position: absolute;
        top:0;
        right:0;
        cursor:pointer;
      }
    }
    .default-content{
      padding: 120px 0 64px;
      background: #36363C url('@/assets/images/post-item/icon-lock-gray.png') no-repeat center 64px;
      background-size:40px 40px;
      border-radius: 10px;
      font-family: D-DINExp;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      text-align: center;
      font-weight: 400;
      line-height:16px;
      margin-top:20px;
    }
    .token-list{
      margin-top:20px;
      background: #36363C;
      border-radius: 10px;
      padding:0 20px;
      .token-item{
        display:flex;
        align-items:center;
        padding:20px 0;
        border-top:1px solid rgba(255,255,255,0.1);
        position:relative;
        &:first-child {
          border:0;
        }
        .token-icon{
          width: 30px;
          height: 30px;
          border-radius:50%;
        }
        .token-count{
          margin-left:12px;
          font-family: D-DINExp-Bold;
          font-size: 14px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          .balance{
            color: #FF6868;
          }
        }
        .token-get{
          position:absolute;
          top:20px;
          right:0;
          line-height:30px;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: right;
          font-weight: 400;
          display:flex;
          align-items: center;
          .more-arrow{
            width:14px;
            height:14px;
          }
        }
      }
      .token-tip{
        padding-bottom:20px;
        font-family: D-DINExp;
        font-size: 14px;
        color: rgba(255,255,255,0.5);
        letter-spacing: 0;
        text-align: center;
        line-height: 22px;
        font-weight: 400;
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
        div{
          padding-right:4px;
        }
      }
      .default{
        .default-text{
          width:100%;
        }
      }
    }
    .images{
      display:flex;
      flex-wrap:wrap;
      width:690px;
      padding-left:20px;
      position: relative;
      left:-20px;
      .img{
        width:650px;
        border-radius:10px;
        margin-right:21px;
        margin-top:20px;
        cursor: pointer;
        position:relative;
      }
      img{
        width:650px;
        border-radius:10px;
        object-fit: cover;
      }
      &.images2{
        .img,img{
          width:314px;
          height:314px;
        }
      }
      &.images-multiple{
        &.images4{
          width:470px;
        }
        .img,img{
          width:202px;
          height:202px;
        }
      }

    }
    .icon-lock{
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width: 80px;
      height: 80px;
      border-radius:50%;
      background: rgba(255,255,255,0.20) url("@/assets/images/post-item/icon-lock.png") no-repeat center center;
      background-size:40px 40px;
    }
    .info-bottom{
      margin-top:20px;
      display:flex;
      justify-content:space-between;
      .info-left{
        display:flex;
        .bottom-token-list{
          display:flex;
          margin-right:30px;
          cursor: pointer;
          .token-icon{
            margin-right:10px;
            width: 24px;
            height: 24px;
            border-radius:50%;
            &.token-icon-gray{
              opacity: 0.5;
            }
            &:last-child{
              margin-right: 0;
            }
          }
        }
        .nft{
          font-family: D-DINExp-Bold;
          font-size: 14px;
          line-height:24px;
          color: #FED23C;
          letter-spacing: 0;
          font-weight: 700;
          cursor: pointer;
          margin-right:30px;
          padding-right:16px;
          background: url('@/assets/images/post-item/icon-nft.png') no-repeat right center;
          background-size: 12px 12px;
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
    .detail-nft{
      display:flex;
      height:57px;
      align-items: center;
      padding-top:20px;
      margin-top:20px;
      border-top:1px solid rgba(255,255,255,0.1);
      position: relative;
      .nft{
        font-family: D-DINExp-Bold;
        font-size: 14px;
        line-height:24px;
        color: #FED23C;
        letter-spacing: 0;
        font-weight: 700;
        cursor: pointer;
        padding-right:16px;
        background: url('@/assets/images/post-item/icon-nft.png') no-repeat right center;
        background-size: 12px 12px;
      }
      .intro-item{
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 400;
        height:18px;
        line-height:18px;
        display:flex;
        align-items: center;
        margin-left:30px;
        span{
          font-family: D-DINExp;
          display:inline-block;
          color: rgba(255,255,255,0.5);
          &.price{
            padding-right:10px;
            background: url(/src/assets/images/common/icon-gas.png) no-repeat center right;
            background-size: 8px;
          }
        }
      }
      .mint-users{
        margin-left:12px;
        display:flex;
        cursor: pointer;
        &.mint-user2{
          margin-right:24px;
        }
        &.mint-user2{
          margin-right:18px;
        }
        .avatar{
          width:18px;
          height:18px;
          border-radius:50%;
          position:relative;
          z-index:3;
          object-fit: cover;
          &.avatar1{
            left:-8px;
            z-index:2;
          }
          &.avatar2{
            left:-16px;
            z-index:1;
          }
        }
      }
      .button-mint-nft{
        position:absolute;
        right:0;
        top:21px;
      }
    }
  }
  .elastic-content{
    width:700px;
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
    .loading-box{
      min-height:300px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .collector-list{
      display: flex;
      flex-wrap: wrap;
      margin-top:30px;
      .collector-item{
        margin-bottom:20px;
        margin-right:20px;
        padding:0 20px;
        width: 335px;
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
          border-radius: 50%;
          object-fit: cover;
        }
        .info{
          margin-left:12px;
          width:150px;
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
            font-size: 14px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0;
            font-weight: 400;
            line-height:16px;
          }
        }
        .number{
          position:absolute;
          height:40px;
          top:20px;
          right:20px;
          display:flex;
          align-items: center;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0;
          font-weight: 400;
          line-height:16px;
          span{
            color: rgba(255,255,255,1);
          }
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


<style lang="scss">
  .pop-token-list{
    padding:10px 30px!important;
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
          span{
            color: rgba(255,255,255,1);
            &.no-access{
              color: #FF6868;
            }
          }
        }
        .check-status{
          margin-left:20px;
          width:16px;
          height:16px;
        }
      }
    }
  }

  .pop-nft-intro{
    position:relative;
    .intro-item{
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 400;
      height:18px;
      line-height:18px;
      margin-bottom:14px;
      display:flex;
      align-items: center;
      span{
        font-family: D-DINExp;
        display:inline-block;
        font-size: 16px;
        &.price{
          padding-right:17px;
          background: url(/src/assets/images/common/icon-gas.png) no-repeat center right;
          background-size: 12px;
        }
      }
    }
    .mint-users{
      display:flex;
      position: absolute;
      justify-content:flex-end;
      top:20px;
      right:20px;
      cursor: pointer;
      .avatar{
        width:18px;
        height:18px;
        border-radius:50%;
        position:relative;
        z-index:1;
        object-fit: cover;
      }
      &.mint-users2{
        .avatar0{
          left:8px;
          z-index:2;
        }
      }
      &.mint-users3{
        .avatar0{
          left:16px;
          z-index:3;
        }
        .avatar1{
          left:8px;
          z-index:2;
        }
      }
    }
    .button-mint-nft{
      margin:30px auto 10px;
    }
  }

  @media
  not screen and (-webkit-min-device-pixel-ratio: 2),
  not screen and (   min--moz-device-pixel-ratio: 2),
  not screen and (     -o-min-device-pixel-ratio: 2/1),
  not screen and (        min-device-pixel-ratio: 2),
  not screen and (                min-resolution: 192dpi),
  not screen and (                min-resolution: 2dppx) { 

    .text .emoji{
      margin-right:4px;
    }

  }

</style>
