import axios from "axios";
import bs58 from "bs58";
import store from "@/store/index.js";


axios.defaults.crossDomain = true;

axios.defaults.withCredentials = true;

axios.defaults.timeout = 1e3 * 30;


//axios.defaults.headers["Access-Control-Allow-Origin"] = "*";
// axios.defaults.headers['Content-Type']='Access-Control-Allow-Headers;application/json;charset=utf-8;Access-Control-Allow-Origin;';
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8;";
// axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
//axios.defaults.headers["Authorization"] = "Access-Control-Allow-Headers";
axios.defaults.headers["Accept"] = "application/json;charset=utf-8;";
//axios.defaults.headers["content-type"] = "application/json";

axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response.data);
  },
  (error) => {
    console.log("[interceptors] - [response] - error", error);
    if (error.response) {
      let _status = String(error.response.status);
      if (["200", "304", "400"].includes(_status)) {
        return Promise.response(error.response);
      }
    }
    return Promise.reject(error);
  }
);

//  sign
async function getSign(method, param) {
  const account = store.state.account
  let data = {
    method_name: method, // method_name - 
    me: account.accountId,
    timestamp: new Date().getTime(),
    args: param,
  };

  if (!store.getters.isLogin) {
    return {
      data
    }
  }

  
  const keyPair = await account.connection.signer.keyStore.getKey(store.state.nearConfig.networkId, account.accountId);

  const data_buffer = Buffer.from(JSON.stringify(data));

  // 
  const { signature } = keyPair.sign(data_buffer);
  // encode 
  let sign = bs58.encode(signature);

  return {
    data,
    signature: sign,
  };
}

export async function get(method, data) {
  // return axios.get("/api/" + method, { params: {data: data } });
  return axios.get("/api/" + method, { params: data  });
}

export async function post(method, data) {
  return axios.post("/api/" + method, await getSign(method, data));
  // return axios.post("/api/" + method, data);
}

