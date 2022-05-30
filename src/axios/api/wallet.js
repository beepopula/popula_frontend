import {get, post} from "../config";

export default {
  change_show_token(data) {
    return post("change_show_token", data);
  },
  get_wallet_tokens(data) {
    return get("get_wallet_tokens", data);
  },
  get_token_holder_count(data) {
    return get("get_token_holder_count", data);
  },
  get_token_owners(data) {
    return get("get_token_owners", data);
  }
};
