<template>
  <div class="elastic-layer confirm-modal-box">
    <div class="confirm-modal">
      <div class="title">{{$props.title}}</div>
      <div class="intro">{{$props.intro}}</div>
      <div class="button-box">
        <div class="mini-button-border button-cancle" @click="cancel">
          <div class="mini-button">Cancle</div>
        </div>
        <div class="mini-button-border" @click="confirm()">
          
          <div class="mini-button">
            <img  v-if="isLoading" class="white-loading" src="@/assets/images/common/loading.png"/>
            <template v-else>Confirm</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, toRefs, watch, getCurrentInstance  } from "vue";
  import { useStore } from 'vuex';
  export default {
    components: {
    },
    props:{
      title:{
        type:String,
        value:''
      },
      intro:{
        type:String,
        value:''
      },
    },
    setup(props,{ emit }) {
      const store = useStore();
      const { proxy } = getCurrentInstance();

      //state
      const state = reactive({
        isLoading:false
      })

      const cancel = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("cancel");
      }

      const confirm = () => {
        if(state.isLoading){
          return;
        }
        state.isLoading = true;
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit("confirm");
      }


      return {
        ...toRefs(state),
        cancel,
        confirm
      };
    },
    mounted(){
      
    },
  }
</script>


<style lang="scss">
  .confirm-modal-box{
    z-index:99999;
    background: rgba(0, 0, 0, 0.3);
  }
  .confirm-modal{
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    width: 320px;
    z-index:99;
    padding:30px;
    background: #000000;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0px 2px 30px 0px rgb(0 0 0 / 50%);
    border-radius: 10px;
    font-family: D-DINExp;
    font-size: 14px;
    color: #FFFFFF;
    font-weight: 400;

    .title{
      font-family: D-DINExp-Bold;
      font-size: 16px;
      color: #FFFFFF;
      letter-spacing: 0;
      font-weight: 700;
    }
    .intro{
      margin-top:8px;
      font-family: D-DINExp;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0;
      text-align: left;
      line-height: 22px;
      font-weight: 400;
      word-break: break-word;
      cursor: default;
    }
    .button-box{
      display:flex;
      justify-content:space-between;
      padding:30px 32px 0;
      .mini-button{
        background:#000;
      }
      .button-cancle{
        background:rgba(255,255,255,0.2);
        &::after{
          display:none;
        }
      }
    }
  }
  

</style>
