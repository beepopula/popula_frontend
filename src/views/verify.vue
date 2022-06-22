<template>
  <div class="main-box">
    <div class="main-header">
      <div class="title">Verify Twitter Account</div>
    </div>
    <div class="main-form">
      <div class="left-form">
        <div class="step step1">
          <div class="step-title">Step 1</div>
          <div class="step-intro">
            Please click this button below and tweet a verification message on Twitter
          </div>
          <a class="twitter-button" target="_blank" :href="'https://twitter.com/intent/tweet?text='+text">
            <div class="twitter-button-text">
              <img src="@/assets/image/footer/twitter.png"/>
              Tweet
            </div>
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
      <div class="twitter-button submit" @click="verify">
        <div class="twitter-button-text">
          verify
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref,reactive, toRefs, getCurrentInstance, onBeforeMount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from 'vuex';
import { getAccountSign } from '../utils/util';
export default {
  setup() {
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      twitter:"",
      signtrue:"",
      text:"",
    });

    const init = async () => {
      state.signtrue = await getAccountSign(store.getters.accountId);
      state.text = 'popula. '+ state.signtrue;
    }
    init();


    const verify = async () => {
      const res = await proxy.$axios.profile.verify_twitter({twitter: state.twitter, sign: state.signtrue,accountId:store.getters.accountId});
      if(res.success){
        proxy.$Message({message: "Twitter account verified successfully",type: "success"});
        setTimeout(()=>{
          router.push("/mine");
        },1000);
      }
    }

    return {
      ...toRefs(state),
      verify
      
    };
  },
};
</script>

<style lang="scss" scoped>
.main-box {
  padding: 140px 80px 73px;
  .main-header {
    .title{
      font-family: D-DINExp-Bold;
      font-size: 60px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
    }
  }

  .main-form{
    margin-top:40px;
    position:relative;
    .left-form{
      width:605px;
      .step{
        margin-bottom:60px;
        .step-title{
          font-family: D-DINExp-Bold;
          font-size: 20px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 700;
          line-height: 26px;
        }
        .step-intro{
          font-family: D-DINExp;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: 0;
          font-weight: 400;
          margin-top:24px;
        }
        :deep(.el-input){
          margin-top:40px;
          input{
            width: 605px;
            height: 80px;
            line-height:80px;
            background: #111113;
            border-radius: 30px;
            padding:0 30px;
            border:0;
            font-family: D-DINExp;
            font-size: 20px;
            color: #FFFFFF;
            letter-spacing: 0;
            line-height: 36px;
            font-weight: 400;
          }
        }
      }
    }
    .twitter-button{
      display:block;
      position:relative;
      width:384px;
      height:148px;
      display: flex;
      align-items: center;
      justify-content: center;
      left:-42px;
      cursor:pointer;
      &.submit{
        left:0;
        margin: 0 auto;
        margin-top:150px;
      }
      &::before{
        display:block;
        content:"";
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        background:url('@/assets/image/create/footer_button_border.png');
      }
      &::after{
        display:block;
        content:"";
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        background:url('@/assets/image/create/footer_button_shadow.png');
        opacity:0;
      }
      &:hover{
        &::after{
          transition: opacity 0.3s;
          opacity:1;
        }
        .twitter-button-text{
          background: #17171A;
          border-radius: 40px;
        }
      }
      .twitter-button-text{
        width:296px;
        height:56px;
        position:relative;
        z-index:1;
        font-family: PingFangSC-Semibold;
        font-size: 18px;
        color: #FFFFFF;
        letter-spacing: 0;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
          margin-right:10px;
        }
      }
    }
  }
  
}


@media screen and (max-width: 816px) {
  .main-box {
    padding: 90px 22px 73px;
    .main-header {
      .title{
        font-size: 36px;
      }
    }

    .main-form{
      margin-top:30px;
      .left-form{
        width:100%;
        .step{
          margin-bottom:45px;
          .step-intro{
            line-height:20px;
            margin-top:15px;
          }
          :deep(.el-input){
            margin-top:30px;
            input{
              width:100%;
              height: 60px;
              line-height:60px;
              background: #111113;
              border-radius: 15px;
              padding:0 20px;
            }
          }
        }
      }
      .twitter-button{
        position:relative;
        width:100%;
        height:45px;
        display: flex;
        align-items: center;
        justify-content: center;
        left:0;
        background: linear-gradient(to right, #F75D23, #E6274E, #5878E5 );
        border-radius:90px;
        padding:2px;
        margin-top:30px;
        &::after,&::before{
          display:none;
        }
        .twitter-button-text{
          width:100%;
          height:41px;
          background: #17171A;
          border-radius:90px;
          img{
            margin-right:10px;
          }
        }
      }
    }
  }
}



@media screen and (min-width: 816px) and (max-width: 1200px) {
  .main-box {
    .main-form{
      .left-form{
        width:450px;
      }
    }
  }
}


</style>
