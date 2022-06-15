import { post, get } from "../config";
import store from "@/store/index.js";

export default {
  //new
  get_user_list(data) {
    return get("v1/user/list", data);
  },
  get_user_info(data) {
    return get("v1/user/info", data);
  },
  get_user_posts(data) {
    return get("v1/user/posts", data);
  },
  get_user_replies(data) {
    return get("v1/user/replies", data);
  },
  get_user_likes(data) {
    return get("v1/user/likes", data);
  },
  get_user_nfts(data) {
    return get("v1/communities/findLikelyNFTs", data);
  },
  get_user_notifications(data) {
    return get("v1/user/getNotifications", data);
  },
};
