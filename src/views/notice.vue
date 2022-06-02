<template>
  <div class="main-box">
    <div class="main">
      <!-- left -->
      <div class="left">
        <div class="title">Notifications</div>
        <!-- loading -->
        <div class="loading-box" v-if="isLoading">
          <img class="white-loading" src="@/assets/images/common/loading.png"/>
        </div>
        <!-- list -->
        <div v-else class="list">
          <template v-for="item in list">
            <div v-if="item.type=='comment' && item.data.count==0" class="comment-item" @click.self="redirectPage('/detail/'+item.comment.postId+'?comment='+item.comment.target_hash,false)">
              <div class="user">
                <el-popover placement="bottom-start"  trigger="hover" @show="item.showUser=true" @hide="item.showUser=false">
                  <template #reference>
                    <img v-if="item.user.avatar" class="avatar" :src="item.user.avatar" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
                    <img v-else  class="avatar" src="@/assets/images/common/user-default.png" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
                  </template>
                  <template v-if="item.showUser">
                    <UserPopup :account="item.accountId"/>
                  </template>
                </el-popover>

                <div class="user-info">
                  <div class="name" @click="redirectPage('/user-profile/'+item.accountId,false)">
                    {{item.user.name || item.accountId}}
                  </div>
                  <el-popover placement="bottom-start"  trigger="hover">
                    <template #reference>
                      <div class="createtime">{{item.time.showTime}}</div>
                    </template>
                    <div class="pop-box pop-tip">{{item.time.hoverTime}}</div>
                  </el-popover>
                </div>
              </div>
              <div class="reply-user">Replying to you</div> 
              <div v-if="item.methodName != 'add_encrypt_comment' || item.isAccess" class="text" @click="redirectPage('/detail/'+item.comment.postId+'?comment='+item.comment.target_hash,false)">
                <pre><div v-html="item.text"></div></pre>
              </div>
              <div class="text-default" v-else @click="redirectPage('/detail/'+item.comment.postId+'?comment='+item.comment.target_hash,false)">
                <img src="@/assets/images/post-item/text-default.png"/>
              </div>
            </div>
            <div v-else-if="item.type=='comment' && item.data.count>0" class="like-item" @click="redirectPage(item.url)">
              <div class="avatar-list">
                <template v-for="user in item.data.likes">
                  <img v-if="user.data.avatar" class="avatar" :src="user.data.avatar"/>
                  <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                </template>
              </div>
              <div class="intro">
                <template v-if="item.data.count==1">
                  <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                </template>
                <template v-if="item.data.count==2">
                  <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                  and 
                  <span>{{item.data.likes[1]['data']['name'] || item.data.likes[1]['data']['account_id']}}</span>
                </template>
                <template v-if="item.data.count>2">
                  <span>{{item.data.likes[0]['data']['name'] || item.data.likes[0]['data']['account_id']}}</span>
                  and {{item.data.count-1}} others
                </template>
                liked your 
                <template v-if="item.comment.postId">reply</template>
                <template v-else>post</template>
              </div>
              <div class="text txt-wrap2">
                {{item.text}}
              </div>
            </div>
            <div v-else-if="item.type=='follow'" class="follow-item" @click="redirectPage('/mine')">
              <div class="avatar-list">
                <template v-for="(user,index) in item.data.follow">
                  <template v-if="index<10">
                    <img v-if="user.data.avatar" class="avatar" :src="user.data.avatar"/>
                    <img v-else  class="avatar" src="@/assets/images/common/user-default.png"/>
                  </template>
                </template>
              </div>
              <div class="intro">
                <template v-if="item.data.count==1">
                  <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                </template>
                <template v-if="item.data.count==2">
                  <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                  and 
                  <span>{{item.data.follow[1]['data']['name'] || item.data.follow[1]['data']['account_id']}}</span>
                </template>
                <template v-if="item.data.count>2">
                  <span>{{item.data.follow[0]['data']['name'] || item.data.follow[0]['data']['account_id']}}</span>
                  and {{item.data.count-1}} others
                </template>
                followed you
              </div>
            </div>
          </template>
        </div>

      </div>
      <!-- right -->
      <div class="right">
        <!-- About -->
        <About/>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, watch, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex';
import { formatAmount, parseAmount, checkCondition, getTimer} from "@/utils/util.js";
import EncryptionContract from "@/contract/EncryptionContract";
import About from '@/component/about.vue';
import UserPopup from '@/component/user-popup.vue';
export default {
  components: {
    About,
    UserPopup
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const encryptionContract = new EncryptionContract(store.state.account);

    //state
    const state = reactive({
      isLoading:false,
      list:[]
    })

    const init = async () => {
      state.isLoading = true;
      const res = await proxy.$axios.profile.get_user_notifications({
        accountId:store.getters.accountId,
        lastTime:'',
      });
      if(res.success){
        state.list = await handleData(res.data);
      }
      state.isLoading = false;
    }

    const handleData = async (data) => {
      const list = [];
      for(let i = 0;i<data.length;i++){//data.length
        const item = data[i];
        if(item.type=='comment' && item.data.count==0){ //reply
          //time
          item.time = getTimer(item.createAt)
          //user
          // const userInfo = await proxy.$axios.profile.get_user_info({
          //   accountId:item.accountId,
          // });
          // if(userInfo.success){
          //   item.user = userInfo.data;
          // }
          item.user = {}
          if(item.methodName == 'add_encrypt_comment'){
            const info = await checkAccess(item);
            if(info.isAccess){
              item.text = info.text;
              item.isAccess = info.isAccess
            }
          }else{
            item.text = item.comment.text;
          }
        }
        if(item.data.count>0){ //like
          //url
          if(item.type=="comment"){
            item.url = `/detail/${item.comment.postId}?comment=${item.comment.target_hash}`
          }else{
            item.url = `/detail/${item.post.target_hash}`
          }
          //text
          if(item.methodName == 'add_encrypt_comment' || item.methodName == 'add_encrypt_post'){
            console.log(item);
            const info = await checkAccess(item);
            if(info.isAccess){
              item.text = info.text;
              item.isAccess = info.isAccess
            }
          }else{
            if(item.type == 'comment'){
              item.text = item.comment.text;
            }else if(item.type == 'post'){
              item.text = item.post.text ? item.post.text : (item.post.imgs.length>0 ? '[Images]' : '') ;
            }
          }
        }
        if(item.type=='follow' && item.data.count>0){ //like
          // const followers = [];
          // const len = Math.min(item.data.count,10);
          // for(let j = 0;j<len;j++ ){
          //   const follow_item = item.data.follow[j];
          //   const userInfo = await proxy.$axios.profile.get_user_info({
          //     accountId:follow_item.accountId,
          //   });
          //   if(userInfo.success){
          //     followers.push(userInfo.data);
          //   }
          // }
      
          // item.followers = followers;
        }
        list.push(item);
      }
      console.log(list,'----list-----');
      return list;
    }

    const checkAccess = async (item) => {
      let encrypt_args = '';
      let communityId = '';
      let result = {}
      if(item.type == 'post'){
        encrypt_args = item.post.encrypt_args;
        communityId = item.post.receiverId;
        result = await proxy.$axios.post.get_sign({
          postId:item.post.target_hash,
          accountId:store.getters.accountId
        });
      }else{
        encrypt_args = item.comment.encrypt_args;
        communityId = item.comment.receiverId;
        result = await proxy.$axios.post.get_sign({
          postId:item.comment.postId,
          commentId :item.comment.target_hash,
          accountId:store.getters.accountId
        });
      }
      if(result.success){
        const param = {
          cipher_text: JSON.parse(encrypt_args), 
          contract_id: communityId, 
          sign: result.data.text_sign
        }
        const res = await encryptionContract.decrypt(param);
        return {
          text:res.text ? res.text : ((item.type == 'post' && item.post.blur_imgs.length>0) ? '[Images]' : ''),
          isAccess:true
        }
      }
      // state.images = Object.values(JSON.parse(res.imgs));
      return {isAccess:false}
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

    return {
      ...toRefs(state),
      init,
    }
  },
  mounted(){
    this.$router.push({query: {}});
    this.init();
  }
}
</script>

<style lang="scss" scoped>
.main {
  .left{
    .title{
      font-family: D-DINExp-Bold;
      font-size: 20px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
      line-height:22px;
    }
    .loading-box{
      min-height:300px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    .list{
      width:690px;
      padding:0 20px;
      margin-top:20px;
      background: #28282D;
      border-radius: 24px;
      >div:last-child{
        border:0;
      }
      .comment-item{
        padding:30px 0;
        border-bottom:1px solid rgba(255,255,255,0.1);
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
              font-family: D-DINExp-Bold;
              height: 18px;
              line-height:18px;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              position: relative;
              cursor: pointer;
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
        }
        .reply-user{
          margin:10px 0;
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
        .text-default{
          margin-top:20px;
          img{
            width:100%;
          }
        }
      }
      .like-item,.follow-item{
        border-bottom:1px solid rgba(255,255,255,0.1);
        padding: 30px 0 30px 60px;
        background:url('@/assets/images/notice/icon-like.png') no-repeat left 30px;
        background-size:40px 40px;
        .avatar-list{
          display: flex;
          height:40px;
          position: relative;
          &:after{
            display: block;
            content:"";
            position:absolute;
            top:0;
            left:0;
            right:0;
            bottom:0;
            background:url('@/assets/images/notice/mask.png') no-repeat left top;
            background-size:100% 100%;
          }
          .avatar{
            width:40px;
            height:40px;
            border-radius:50%;
            object-fit: cover;
            margin-right:16px;
          }
        }
        .intro{
          margin-top:16px;
          height: 17px;
          font-family: D-DINExp;
          font-size: 16px;
          color: rgba(255,255,255,0.50);
          letter-spacing: 0;
          line-height: 17px;
          font-weight: 400;
          display:flex;
          align-items: center;
          span{
            color: rgba(255,255,255,1);
            margin:0 4px;
          }
        }
        .text{
          margin-top:16px;
          width: 586px;
          padding:16px 20px;
          background: #111113;
          border-radius: 10px;
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: justify;
          line-height: 24px;
          font-weight: 400;
        }
      }
      .follow-item{
        background:url('@/assets/images/notice/icon-users.png') no-repeat left 30px;
        background-size:40px 40px;
      }

    }
  }
}
</style>
