import {get, post} from "../config";

export default {
  change_show_token(data) {
    return post("change_show_token", data);
  },
  get_token_info(data) {
    return get("get_token_info", data);
  },
  get_token_list(data) {
    return get("get_token_list", data);
  },
  get_token_detail(data) {
    return get("get_token_detail", data);
  },

};
