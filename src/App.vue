<template>
  <Index></Index>
</template>
<script>
import Index from "./views/index.vue";
export default {
  components:{
    Index,
  },
  setup() {
  }
};
</script>

<style lang="scss">
@import "./styles/common.scss";
html,
body {
  height: 100%;
}

body {
  margin: 0;
  overflow-y: scroll;
  overflow-x: hidden;
}


#app,
textarea {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  resize:none;
}



.g_model_light {
  div {
    color: #333;
  }
  .post-show-list-box {
    .item {
      background: #d8d8d8 !important;
    }
  }
  .theme-btn-img.black {
    opacity: 0;
  }
}

.g_model_black {
  .post-show-list-box {
    .item {
      background: #262b34;
    }
  }
  .theme-btn-img.light {
    opacity: 0;
  }
}
</style>
