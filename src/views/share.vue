<template>
  <div class="page"></div>
</template>

<script>
import { reactive, toRefs,} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import MainContract from "@/contract/MainContract";
import * as bs58 from 'bs58';
export default {
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const mainContract = new MainContract(store.state.account);

    const init = async () => {
      const parmsJson = bs58.decode(route.params.id).toString();
      const args = JSON.parse(parmsJson)['args'];
      //storage
      const postInfo = JSON.parse(localStorage.getItem("postInfo")) || [];
      // console.log(args,args.inviter_id ,store.getters.accountId , postInfo.indexOf(parmsJson));
      if(args.inviter_id && args.inviter_id!=store.getters.accountId && postInfo.indexOf(parmsJson)==-1){
        let recorded = true;
        if(store.getters.accountId){
          const check_params = {
            ...args,
            account_id:store.getters.accountId
          }
          recorded = await store.state.viewAccount.viewFunction(store.state.nearConfig.MAIN_CONTRACT, "check_viewed", check_params); 
        }
        if(!recorded){
          localStorage.setItem("postInfo",JSON.stringify(postInfo.concat(parmsJson)));
        }
      }
      //router
      const hierarchies = args.hierarchies;
      const len = hierarchies.length;
      if(len==1){ //post
        router.push(`/detail/${hierarchies[0]['target_hash']}`)
      }else if(len>1){ //comment
        router.push(`/detail/${hierarchies[0]['target_hash']}?comment=${hierarchies[len-1]['target_hash']}`)
      }
    }
    init()

    return {
    }
  }
}
</script>

<style lang="scss" scoped>
  .page{
    height:100vh;
    background-color: #17171A;
  }
</style>
