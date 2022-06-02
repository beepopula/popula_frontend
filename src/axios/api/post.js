import {get,post} from "../config";

export default {
  new_post(data) {
    return post("new_post", data);
  },
  edit_post(data) {
    return post("edit_post", data);
  },
  add_my_token(data) {
    return post("add_my_token", data);
  },
  sign_posts(data){
    return post("sign_posts", data);
  },
  encrypt_post(data){
    return post("encrypt_post", data);
  },
  decrypt_posts(data){
    return post("decrypt_posts", data);
  },



  //new
  get_post_list(data) {
    return get("v1/post/list", data);
  },
  get_post_detail(data) {
    return get("v1/post/detail", data);
  },
  delete(data) {
    return post("v1/post/delete", data);
  },
  report(data) {
    return post("v1/user/report", data);
  },
  get_sign(data) {
    return post("v1/post/getSignByPostId", data);
  },
  at(data) {
    return get("v1/communities/At", data);
  },
  share_record(data) {
    return post("v1/user/share", data);
  },
};