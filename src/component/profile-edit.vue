<template>
  <!-- edit layer-->
  <div class="elastic-layer edit-layer">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box" v-if="showVerify">
      <div class="edit-head">
        <div class="edit-btn"><span class="arrow return" @click="showVerify=false"></span>return</div>
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
        <div class="edit-btn"><span class="arrow form-close" @click="closeEditLayer()"></span>Edit profile</div>
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">
            <img v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Save</template>
          </div>
        </div>
      </div>
      <div class="edit-form">
        <!-- avatar -->
        <el-upload
          class="upload-avatar"
          :show-file-list="false"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          list-type="picture-card"
          :on-change="uploadAvatar"
          :auto-upload="false"
        >
          <div class="avatar-box">
            <img v-if="editProfile.avatar" class="avatar" :src="$store.getters.getAwsImg(editProfile.avatar)" @error.once="$event.target.src=editProfile.avatar" />
            <div class="upload-button"></div>
          </div>
        </el-upload>
        <!-- background -->
        <el-upload
          class="upload-background"
          :show-file-list="false"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          list-type="picture-card"
          :on-change="uploadBackground"
          :auto-upload="false"
        >
          <div class="background-box">
            <img v-if="editProfile.background" class="background" :src="$store.getters.getAwsImg(editProfile.background)" @error.once="$event.target.src=editProfile.background" />
            <div class="upload-button"></div>
          </div>
        </el-upload>
        <div class="mian-form">
          <!-- Account -->
          <div class="form-item form-item-account">
            <div class="form-item-content">
              <el-input placeholder="Your name"  v-model="$props.accountId"  disabled/>
            </div>
          </div>
          <!-- Name -->
          <div class="form-item">
            <div class="form-item-tip" v-if="nameError"> Name can’t be blank</div>
            <div class="form-item-label" v-else> Name</div>
            <div class="form-item-content">
              <el-input placeholder="Your name"  v-model="editProfile.name"  maxlength="50" show-word-limit/>
            </div>
          </div>
          <!-- Bio -->
          <div class="form-item">
            <div class="form-item-label"> Bio</div>
            <div class="form-item-content">
              <el-input  placeholder="Tell others more about you!  " v-model="editProfile.bio" type="textarea" maxlength="160" show-word-limit />
            </div>
          </div>
          <!-- Binding -->
          <div class="form-item form-item-media">
            <div class="form-item-label"> Binding</div>
            <div class="form-item-content">
              <div :class="[editProfile.website.url?'':'empty']">
                <el-input class="website-input" placeholder="Paste link here  " v-model="editProfile.website.url" />
              </div>
              <div :class="['verify-box',editProfile.twitter.url?'':'empty']">
                <el-input class="twitter-input" placeholder="Paste link here  " v-model="editProfile.twitter.url" />
                <div class="verify-button" @click="showVerify=true">Verify</div>
              </div>
              <div :class="[editProfile.instagram.url?'':'empty']">
                <el-input class="instagram-input" placeholder="Paste link here  " v-model="editProfile.instagram.url" />
              </div>
              <div :class="[editProfile.youtube.url?'':'empty']">
                <el-input class="youtube-input" placeholder="Paste link here  " v-model="editProfile.youtube.url" />
              </div>
              <div :class="[editProfile.tiktok.url?'':'empty']">
                <el-input class="tiktok-input" placeholder="Paste link here  " v-model="editProfile.tiktok.url" />
              </div>
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
  import Cropper from '@/component/cropper.vue';
  import { getAccountSign } from '../utils/util';
  export default {
    components: {
      Cropper
    },
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
        editProfile:{...props.editInfo},
        paramName:'',
        nameError:false,
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


      //edit avatar & background
      const avatarCropper= ref()
      const backgroundCropper= ref()
      const uploadAvatar = (file) => {
        state.paramName = 'avatar';
        avatarCropper.value.uploads(file);
      }
      const uploadBackground = (file) => {
        state.paramName = 'background'
        backgroundCropper.value.uploads(file);
      }
      const changeicon = (e) => {
        state.editProfile[state.paramName] = e;
      }

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
        if(!state.editProfile.name || !state.editProfile.name.trim()){
          state.nameError = true;
          return;
        }
        state.nameError = false;
        // proxy.$Loading.showLoading({title: "Loading"});
        state.isLoading = true;
        const param = {
          accountId:store.getters.accountId,
          name:state.editProfile.name,
          avatar : state.editProfile.avatar,
          background : state.editProfile.background,
          bio : state.editProfile.bio,
          website :state.editProfile.website.url,
          twitter : state.editProfile.twitter.url,
          instagram : state.editProfile.instagram.url,
          youtube : state.editProfile.youtube.url,
          tiktok : state.editProfile.tiktok.url
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
        avatarCropper,
        backgroundCropper,
        uploadAvatar,
        uploadBackground,
        changeicon,
        closeEditLayer,
        verify,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .edit-layer{
    background: rgba(0,0,0,0.9);
    .edit-box{
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      width: 690px;
      max-height: calc(100vh - 120px);
      background: #28282D;
      border-radius: 24px;
      overflow: hidden;
      padding-bottom:20px;
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
        background: #45454B;
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
        .edit-btn{
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
            width:24px;
            height:24px;
            margin-right:8px;
            &.return{
              background:url("@/assets/images/common/icon-arrow-left.png") no-repeat center center;
              background-size:16px 16px;
            }
            &.form-close{
              background:url("@/assets/images/common/icon-close.png") no-repeat center center;
              background-size:16px 16px;
            }
          }
        }
      }
      .edit-form{
        position:relative;
        .upload-avatar{
          position:absolute;
          left:16px;
          top:140px;
          z-index: 2;
          :deep(.el-upload){
            width: 98px;
            height: 98px;
            padding:4px;
            border:0;
            border-radius:50%;
            background: rgba(40,40,45,1);
            .avatar-box{
              width: 90px;
              height: 90px;
              border-radius:50%;
              position:relative;
              .avatar{
                width: 90px;
                height: 90px;
                object-fit: cover;
                border-radius:50%;
              }
              .upload-button{
                width: 90px;
                height: 90px;
                border-radius:50%;
                background: rgba(0,0,0,0.50) url("@/assets/images/common/icon-upload.png") no-repeat center center;
                background-size:30px;
                position:absolute;
                top:0;
                left:0;
              }
            }
          }
        }
        .upload-background{
          margin-bottom: 68px;
          :deep(.el-upload){
            width: 690px;
            height: 170px;
            background: #111113;
            border:none;
            .background-box{
              width: 690px;
              height: 170px;
              position:relative;
              .background{
                width: 690px;
                height: 170px;
                object-fit: cover;
              }
              .upload-button{
                width: 70px;
                height: 70px;
                border-radius:50%;
                background: rgba(255,255,255,0.10) url("@/assets/images/common/icon-upload.png") no-repeat center center;
                background-size:30px;
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%);
              }
            }
          }
        }
        .mian-form{
          padding:0 20px;
          max-height: calc(100vh - 464px);
          overflow-y: scroll;
          .form-item{
            padding-top:40px;
            .form-item-label{
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FFFFFF;
              letter-spacing: 0;
              font-weight: 700;
              line-height:20px;
            }
            .form-item-tip{
              font-family: D-DINExp-Bold;
              font-size: 14px;
              color: #FF6868;
              letter-spacing: 0;
              font-weight: 700;
              line-height: 20px;
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
                  border-radius:0;
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
            &.form-item-account{
              padding-top:30px;
              .form-item-content{
                margin-top:0;
                :deep(.el-input){
                  width:100%;
                  input{
                    background: #36363C;
                    color: rgba(255,255,255,0.3);
                  }
                }
              }
            }
            &.form-item-media{
              .empty{
                :deep(.el-input){
                  padding-bottom:15px;
                  &.website-input{
                    input{
                      background-image:url('@/assets/images/common/logo-link-hover.png');
                    }
                  }
                  &.twitter-input{
                    input{
                      background-image:url('@/assets/images/common/logo-twitter-hover.png');
                    }
                  }
                  &.instagram-input{
                    input{
                      background-image:url('@/assets/images/common/logo-instagram-hover.png');
                    }
                  }
                  &.youtube-input{
                    input{
                      background-image:url('@/assets/images/common/logo-youtube-hover.png');
                    }
                  }
                  &.tiktok-input{
                    input{
                      background-image:url('@/assets/images/common/logo-tiktok-hover.png');
                    }
                  }
                }
                
              }
              :deep(.el-input){
                padding-bottom:15px;
                input{
                  padding-left:44px;
                }
                &.website-input{
                  input{
                    background:#36363C url('@/assets/images/common/logo-link.png') no-repeat 16px center;
                    background-size:16px;
                  }
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