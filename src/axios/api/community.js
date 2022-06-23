import { post, get } from "../config";
import store from "@/store/index.js";

export default {
  //new
  get_joined_community_list(data) {
    return get("v1/user/communities", data);
  },
  get_unjoined_community_list(data) {
    return get("v1/user/unJoinCommunities", data);
  },
  get_community_list(data) {
    return get("v1/communities/list", data);
  },
  get_community_detail(data) {
    return get("v1/communities/detail", data);
  },
  get_member_list(data) {
    return get("v1/communities/members", data);
  },
  replacement_sequence(data) {
    return post("v1/communities/replacementSequence", data);
  },
  set_community_basicinfo(data) {
    return post("v1/communities/update", data);
  },
};
