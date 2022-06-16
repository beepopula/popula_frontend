<template>
  <div class="page"></div>
</template>

<script>
import { reactive, toRefs,} from "vue";
import { useRoute,useRouter } from "vue-router";
import { useStore } from 'vuex';
import * as bs58 from 'bs58';
export default {
  setup(){
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const init = () => {
      const argsJson = bs58.decode(route.params.id).toString();
      const args = JSON.parse(argsJson);
      //storage
      const postInfo = JSON.parse(localStorage.getItem("postInfo")) || [];
      if(args.invitor && args.invitor!=store.getters.accountId && postInfo.indexOf(argsJson)==-1){
        localStorage.setItem("postInfo",JSON.stringify(postInfo.concat(argsJson)));
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
