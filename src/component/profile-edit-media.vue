<template>
  <!-- edit layer-->
  <div class="elastic-layer edit-layer" @click.self="closeEditLayer()">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box" v-if="showVerify">
      <div class="edit-head">
        <div class="return-btn" @click="showVerify=false"><span class="arrow"></span>return</div>
        <div class="mini-button-border">
          <div class="mini-button" @click="verify()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>verify</template>
          </div>
        </div>
      </div>
      <div class="edit-form">
        <div class="mian-form">
          <!-- Verify -->
          <div class="verify">
            <div class="step step1">
              <div class="step-title">Step 1</div>
              <div class="step-intro">
                Please click this button below and tweet a verification message on Twitter
              </div>
              <a class="twitter-button" target="_blank" :href="'https://twitter.com/intent/tweet?text='+text">
                <img src="@/assets/images/common/logo-twitter.png"/>
              Tweet
              </a>
            </div>
            <div class="step step2">
              <div class="step-title">Step 2</div>
              <div class="step-intro">
                On your tweet, find the share button. Copy link and paste it here. Click the button to verify your account
              </div>
              <el-input  placeholder="Paste link here"  v-model="twitter"  />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="edit-box" v-else>
      <div class="edit-head">
        Edit profile
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Save</template>
          </div>
        </div>
      </div>
      <div class="edit-form">
        <div class="mian-form">
          <!-- Binding -->
          <div class="form-item form-item-media">
            <div class="form-item-content">
              <div class="verify-box">
                <el-input class="twitter-input" placeholder="Paste link here  " v-model="editProfile.twitter.url" />
                <div class="verify-button" @click="showVerify=true">Verify</div>
              </div>
              <el-input class="instagram-input" placeholder="Paste link here  " v-model="editProfile.instagram.url" />
              <el-input class="youtube-input" placeholder="Paste link here  " v-model="editProfile.youtube.url" />
              <el-input class="tiktok-input" placeholder="Paste link here  " v-model="editProfile.tiktok.url" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Cropper ref='avatarCropper' :aspectRatio="1" @changeicon="changeicon"></Cropper>
  <Cropper ref='backgroundCropper' :aspectRatio="23/8" @changeicon="changeicon"></Cropper>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  import { getAccountSign } from '../utils/util';
  export default {
    props:{
      editInfo:{
        type:Object,
        value:{}
      },
      accountId:{
        type:String,
        value:""
      }
    },
    setup(props,{emit}) {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const { proxy } = getCurrentInstance();
      const state = reactive({
        editProfile:props.editInfo,
        isLoading:false,
        showVerify:false,
        twitter:"",
        signtrue:"",
        text:"",
      })

      const init = async () => {
        state.signtrue = await getAccountSign(store.getters.accountId);
        state.text = 'popula. '+ state.signtrue;
      }
      init();

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      const verify = async () => {
        if(!state.twitter.trim()){
          proxy.$Message({message: "Please copy the tweet link first and paste it into the input box in the second step",type: ""});
        }
        const res = await proxy.$axios.profile.verify_twitter({twitter: state.twitter, sign: state.signtrue,accountId:store.getters.accountId});
        if(res.success){
          proxy.$Message({message: "Twitter account verified successfully",type: "success"});
          state.editProfile.twitter.url = res.data.author_url;
          state.showVerify = false;
        }else{
          proxy.$Message({message: "Twitter Account verification failed",type: "error"});
        }
      }

      //save
      const save = async () => {
        if(state.isLoading){ return; }
        // proxy.$Loading.showLoading({title: "Loading"});
        state.isLoading = true;
        const param = {
          accountId:store.getters.accountId,
          twitter : state.editProfile.twitter.url,
          instagram : state.editProfile.instagram.url,
          youtube : state.editProfile.youtube.url,
          tiktok : state.editProfile.tiktok.url,

          bio : state.editProfile.bio,
        }
        const res = await proxy.$axios.profile.set_user_info(param);
        if(res.success){
          //update info
          emit("updateInfo",state.editProfile);
        }
        // proxy.$Loading.hideLoading();
        state.isLoading = false;

      }

      return {
        ...toRefs(state),
        save,
        verify,
        closeEditLayer,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .edit-layer{
    background: rgba(0,0,0,0.56);
    .edit-box{
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width: 690px;
      max-height: calc(100vh - 120px);
      padding-bottom:5px;
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      .edit-head{
        display:flex;
        align-items: center;
        justify-content:space-between;
        height:76px;
        padding:0 20px;
        font-family: D-DINExp-Bold;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 700;
        background: #36363C;
        .return-btn{
          height:24px;
          line-height: 24px;
          display:flex;
          align-items:center;
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          cursor: pointer;
          .arrow{
            display:block;
            width:16px;
            height:16px;
            margin-right:12px;
            background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
            background-size:16px 16px;
            transform:rotate(180deg);

          }
          
        }
        .mini-button-border{
          padding: 2px;
          width: 90px;
          height: 40px;
          border-radius: 24px;
          background:  rgba(255,255,255,0.2);
          cursor:pointer;
          position:relative;
          &::after {
            content: "";
            position: absolute;
            top: 0;
            left:0;
            width: 100%;
            height: 100%;
            transform-origin:center;
            transform:scale(1.1);
            filter: blur(10px) brightness(80%) opacity(.8);
            border-radius: 24px;
            background:  #FED23C;
            z-index: 1;
            transition:opacity 0.7s;
            opacity:0;
          }
          &:hover{
            background:  #FED23C;
            &::after {
              opacity:0.8;
            }
          }
          .mini-button{
            width: 86px;
            height: 36px;
            border-radius: 20px;
            background: #28282D;
            display:flex;
            align-items: center;
            justify-content: center;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
            position:relative;
            z-index:2;
          }
        }
      }
      .edit-form{
        position:relative;
        .mian-form{
          padding:0 20px;
          max-height: calc(100vh - 196px);
          overflow-y: scroll;
          .form-item{
            padding-top:40px;
            &:first-child{
              padding-top:5px;
            }
            .form-item-label{
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .form-item-content{
              margin: 15px 0 0;
              :deep(.el-input){
                width:100%;
                input{
                  width:100%;
                  height: 50px;
                  line-height:48px;
                  background: #36363C;
                  border-radius: 10px;
                  padding:0 16px;
                  border:1px solid transparent;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 400;
                }
                .el-input__count{
                  background:transparent;
                  .el-input__count-inner{
                    padding:0 10px;
                    background:transparent;
                    opacity: 0.5;
                    font-family: D-DINExp;
                    font-size: 14px;
                    color: #FFFFFF;
                    letter-spacing: 0;
                    text-align: right;
                    font-weight: 400;
                  }
                }
              }
              :deep(.el-textarea){
                width:100%;
                border-radius: 10px;
                overflow:hidden;
                padding:15px;
                background: #36363C;
                textarea{
                  width:100%;
                  min-height:82px!important;
                  background: transparent;
                  padding:0;
                  font-family: D-DINExp;
                  font-size: 16px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  line-height: 26px;
                  font-weight: 400;
                  border:0;
                  resize:none;
                }
                .el-input__count{
                  background:transparent;
                  bottom:16px;
                  right:16px;
                  opacity: 0.5;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: right;
                  font-weight: 400;
                }
              }
            }
            &.form-item-media{
              :deep(.el-input){
                padding-bottom:15px;
                input{
                  padding-left:44px;
                }
              
                &.twitter-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-twitter.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
                &.instagram-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-instagram.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
                &.youtube-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-youtube.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
                &.tiktok-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-tiktok.png') no-repeat 16px center;
                    background-size:16px;
                  }
                }
              }
              .verify-box{
                position:relative;
                .verify-button{
                  position: absolute;
                  top:0;
                  right:20px;
                  display:flex;
                  align-items: center;
                  height:50px;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  font-weight: 400;
                  padding-right:16px;
                  cursor: pointer;
                  background:url("@/assets/images/common/icon-arrow-right.png") no-repeat right center;
                  background-size:12px 12px;
                }
                :deep(.el-input){
                  padding-bottom:15px;
                  input{
                    padding-right:85px;
                  }
                }
              }
            }
          }
          .step{
            padding:20px 0;
            .step-title{
              font-family: D-DINExp-Bold;
              font-size: 18px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .step-intro{
              margin-top:9px;
              font-family: D-DINExp;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              line-height: 22px;
              font-weight: 400;
            }
            .twitter-button{
              margin:20px 0;
              width:240px;
              height:50px;
              border: 2px solid #FED23C;
              border-radius: 40px;
              display:flex;
              align-items: center;
              justify-content:center;
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              img{
                width:16px;
                margin-right: 8px;
              }

            }
            :deep(.el-input){
              margin-top:20px;
              width:100%;
              input{
                width:100%;
                height: 50px;
                line-height:48px;
                background: #36363C;
                border-radius: 10px;
                padding:0 16px;
                border:1px solid transparent;
                font-family: D-DINExp;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
              .el-input__count{
                background:transparent;
                .el-input__count-inner{
                  padding:0 10px;
                  background:transparent;
                  opacity: 0.5;
                  font-family: D-DINExp;
                  font-size: 14px;
                  color: #FFFFFF;
                  letter-spacing: 0;
                  text-align: right;
                  font-weight: 400;
                }
              }
            }
          }

        }
      }
    }
  }
</style>