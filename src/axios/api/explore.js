import {post, get} from "../config";
import store from '@/store/index.js';

export default {
  get_explore_posts(data) {
    return post("get_explore_posts", data);
  },
  get_explore_items(data) {
    data.me_id = store.getters.accountId
    return get("get_explore_items", data);
  },
  get_post(data) {
    return post("get_post", data);
  },
  get_item(data) {
    data.me_id = store.getters.accountId
    return get("get_item", data);
  },
  follow(data) {
    return post("follow", data);
  },
  unfollow(data) {
    return post("unfollow", data);
  },
  check_follow(data) {
    return post("check_follow", data)
  },
  check_is_follow(data) {
    return get("check_is_follow", data)
  },
  get_follower_count(data) {
    return get("get_follower_count", data)
  },
  check_is_like(data) {
    return get("check_is_like", data)
  },
  get_like_count(data) {
    return get("get_like_count", data)
  }
};
