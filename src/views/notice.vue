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
          <div class="item">
            <!--
            <div class="comment-mod">
              <div class="comment-item" @click.self="">
                <div class="user" v-if="item.data">
                  <el-popover placement="bottom-start"  trigger="hover" @show="showUser=true" @hide="showUser=false">
                    <template #reference>
                      <img v-if="user.avatar" class="avatar" :src="user.avatar" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
                      <img v-else  class="avatar" src="@/assets/images/common/user-default.png" @click="redirectPage('/user-profile/'+item.accountId,false)"/>
                    </template>
                    <template v-if="showUser">
                      <UserPopup :account="item.accountId" @login="showLogin=true"/>
                    </template>
                  </el-popover>

                  <div class="user-info">
                    <div class="name" @click="redirectPage('/user-profile/'+item.accountId,false)">
                      {{item.accountId}}
                    </div>
                    <el-popover placement="bottom-start"  trigger="hover">
                      <template #reference>
                        <div class="createtime">{{time.showTime}}</div>
                      </template>
                      <div class="pop-box pop-tip">{{time.hoverTime}}</div>
                    </el-popover>
                  </div>
                </div>
                <div class="reply-user" v-if="item.data.replay">
                  Replying to 
                  <el-popover placement="bottom-start"  trigger="hover" @show="showReplyUser=true" @hide="showReplyUser=false">
                    <template #reference>
                      <span>@{{item.data.replay}}</span>
                    </template>
                    <template v-if="showReplyUser">
                      <UserPopup :account="item.data.replay" @login="showLogin=true"/>
                    </template>
                  </el-popover>
                </div> 
                <div class="text" @click="">
                  <pre ref="textDom"><div v-html="text"></div></pre>
                </div>
              </div>
            </div>
            -->
            <div class="like-mod">

            </div>
            <div class="follow-mod">

            </div>
          </div>
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
import About from '@/component/about.vue';
export default {
  components: {
    About,
  },
  setup(){
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    //state
    const state = reactive({
      isLoading:false,
    })

    const init = () => {
      
    }

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
      .item{
        padding:20px;
        margin-top:20px;
        background: #28282D;
        border-radius: 24px;
        .comment-mod{
          border-bottom:1px solid rgba(255,255,255,0.1);
          .comment-item{
            &.layer-comment-item{
              padding:20px 0;
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
              position: relative;
              top:10px;
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
          }
        }
        .like-mod{

        }
        .follow-mod{

        }
      }
    }
  }
}
</style>
