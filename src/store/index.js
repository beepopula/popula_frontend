import { createStore } from "vuex";
import getConfig from "../config";

function loginWallet() {
  if (typeof window.near !== 'undefined' && window.near.isSender && window.near.isSignedIn() && window.localStorage.getItem("popula_wallet_auth_key")) {
    return "sender"
  }
  if (window.localStorage.getItem("popula_wallet_auth_key")) {
    return "near"
  }
  return
}

const state = () => ({
  theme: "black",
  near: {},
  wallectConnection: {},
  account: {},
  viewAccount: {},
  nearConfig: {},
  signedIn: !!loginWallet(),
  profile: {},
  provider: {},
  searchWord:""
});

const mutations = {
  setTheme(state, value) {
    state.theme = value;
  },
  setNear(state, value) {
    state.near = value
  },
  setWalletConnection(state, value) {
    state.walletConnection = value
  },
  setAccount(state, value) {
    state.account = value
  },
  setViewAccount(state, value) {
    state.viewAccount = value
  },
  setNearConfig(state, value) {
    state.nearConfig = value
  },
  setSignedIn(state, value) {
    state.signedIn = value
  },
  setProfile(state, value) {
    state.profile = value
  },
  setProvider(state, value) {
    state.provider = value
  },
  setSearchWord(state, value) {
    state.searchWord = value
  }
};

const actions = {
  async login({ commit, getters, state}, wallet) {
    if (!getters.isLogin) {
      if (!wallet || wallet == "near") {
        await state.walletConnection.requestSignIn(state.nearConfig.MAIN_CONTRACT);
      } else if (wallet == "sender") {
        const res = await window.near.requestSignIn({
          contractId: state.nearConfig.MAIN_CONTRACT, 
        })
        if (res && res.accessKey) {
          console.log(res.accountId,window.near.accountId);
          history.go(0);
        }else{
          return res;
        }
      }
    }
  },

  async logout({ commit, getters, state }) {
    if (getters.loginWallet == "sender") {
      await window.near.signOut()
    } else {
      await state.walletConnection.signOut()
      commit("setAccount", {})
      commit("setSignedIn", false)
    }
  }
}

const getters = {
  isLogin(state, getters) {
    return !!getters.loginWallet
  },

  accountId(state) {
    if (!state.account) {
      return
    }
    return state.account.accountId
  },

  loginWallet(state) {
    if (!state.signedIn) {
      return
    }
    return loginWallet()
  },

  getAwsImg() {
    const nearConfig = getConfig();
    return (img)=>{
      if(img.indexOf(nearConfig.IPFS+'/ipfs')>-1){
        return img.replace(nearConfig.IPFS+'/ipfs',nearConfig.AWS_STORAGE)
      }else{
        return img
      }
    }
  }
}

const store = createStore({
  state,
  mutations,
  getters,
  actions
});

export default store;
