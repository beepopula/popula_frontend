<template>
  <div class="elastic-layer edit-layer" @click.self="closeEditLayer()">
    <div class="edit-button close" @click="closeEditLayer()"></div>
    <div class="edit-box">
      <div class="edit-head">
        Edit News
        <div class="mini-button-border">
          <div class="mini-button" @click="save()">Save</div>
        </div>
      </div>
      <div class="edit-form">
        <div class="main-form">
          <div class="form-title"> 
            Add News
            <div class="add-btn" @click="addNews()"></div>
          </div>
          <div class="read-box">
            <el-input  placeholder=""   v-model="link"/>
            <div class="read-btn" @click="readUrl()">ok</div>
          </div>

          <div class="form-title"> News</div>
          <div class="form-content">
            <div class="news-item" v-for="(item,index) in news">
              <div class="form-item" v-if="item.url">
                <div class="form-item-label">News Url</div>
                <div class="form-item-content">
                  <el-input  placeholder=""   v-model="item.url" disabled/>
                </div>
              </div>
              <div class="form-item">
                <div class="form-item-label">Cover</div>
                <div class="form-item-content">
                  
                </div>
              </div>
              <div class="form-item">
                <div class="form-item-label">Title</div>
                <div class="form-item-content">
                  <el-input  placeholder=""   v-model="item.title" maxlength="50" show-word-limit/>
                </div>
              </div>
              <div class="form-item">
                <div class="form-item-label">Introduction</div>
                <div class="form-item-content">
                  <el-input  placeholder="" type="textarea" autosize v-model="item.introduction" maxlength="300" show-word-limit/>
                </div>
              </div>
              <div class="delete-btn" @click="deleteNews(index)"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, getCurrentInstance, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useStore } from 'vuex';
  export default {
    components: {
    },
    props:{
      editInfo:{
        type:Array,
        value:[]
      },
      communityId:{
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
        news:props.editInfo && props.editInfo.length>0 ? props.editInfo : [{url:'',title:''}],
        //other
        link:''
      })

      const closeEditLayer = () => {
        document.getElementsByTagName('body')[0].classList.remove("fixed");
        emit('closeEditLayer');
      }

      const readUrl = () => {
        
      }

      const addNews = () => {
        state.news.push({
          picture:'',
          title:'',
          introduction:'',
          creator:'',
          time:''
        })
      }

      const deleteNews = (index) => {
        state.news.splice(index,1)
      }

      //edit
      const save = async () => {
        proxy.$Loading.showLoading({title: "Loading"});
        const param = {
          accountId:'bhc8521.testnet', //store.getters.accountId,
          communityId:props.communityId,
          news:state.news
        }
        try{
          // const res = await proxy.$axios.community.set_community_contributor(param);
          // if(res.success){
          //   emit('updateInfo',state.edit);
          // }else{
          //   throw new Error("request failed")
          // }
        }catch(e){
          console.log("set_community_news:"+e);
          proxy.$Message({
            message: "Edit Failed",
            type: "error",
          });
        }
        proxy.$Loading.hideLoading();
        
      }

      return {
        ...toRefs(state),
        readUrl,
        addNews,
        deleteNews,
        save,
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
        padding:0 0 20px;
        .main-form{
          padding:20px 20px 0;
          max-height: calc(100vh - 216px);
          overflow-y: scroll;
          .form-title{
            display: flex;
            align-items: center;
            justify-content:space-between;
            height:24px;
            font-family: D-DINExp-Bold;
            font-size: 14px;
            color: #FFFFFF;
            letter-spacing: 0;
            font-weight: 700;
            margin-bottom:12px;
            .add-btn{
              width:24px;
              height:24px;
              background: url('@/assets/images/common/icon-add.png') no-repeat center;
              background-size:24px 24px;
              cursor: pointer;
            }
          }
          .read-box{
            margin:8px 0 40px;
            height:50px;
            display: flex;
            align-items: center;
            justify-content:space-between;
            :deep(.el-input){
              width:489px;
              input{
                width:100%;
                height: 50px;
                line-height:48px;
                background: #36363C;
                border-radius: 10px;
                padding:0 16px;
                border: transparent;
                font-family: D-DINExp;
                font-size: 16px;
                color: #FFFFFF;
                letter-spacing: 0;
                font-weight: 400;
              }
            }
            .read-btn{
              width: 141px;
              height: 50px;
              border: 2px solid rgba(255,255,255,0.2);
              border-radius: 40px;
              display: flex;
              align-items: center;
              justify-content:center;
              font-family: D-DINExp-Bold;
              font-size: 16px;
              color: rgba(255,255,255,0.3);
              letter-spacing: 0;
              text-align: center;
              font-weight: 700;
              cursor: pointer;
              &:hover{
                color: rgba(255,255,255,1);
                border: 2px solid #FED23C;
              }
            }
          }
          .news-item{
            background: #36363C;
            border-radius: 10px;
            margin-bottom:20px;
            padding:20px;
            position:relative;
            &:last-child{
              margin-bottom: 0;
            }
            .delete-btn{
              position:absolute;
              top:-4px;
              right:-4px;
              width: 24px;
              height: 24px;
              cursor: pointer;
              border-radius:50%;
              background: #28282D url("@/assets/images/common/icon-delete.png") no-repeat center center;
            }
          }
          .form-item{
            padding-top:40px;
            &:first-child{
              padding-top:0;
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
                  background: transparent;
                  border-radius: 10px;
                  padding:0 16px;
                  border: 1px solid rgba(255,255,255,0.2);
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
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
                textarea{
                  width:100%;
                  min-height:52px!important;
                  background: transparent;
                  border-radius: 0px;
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
          }
        }
      }
    }
  }
</style>