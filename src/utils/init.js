import store from "@/store/index.js";
import * as nearAPI from 'near-api-js';
import getConfig from "../config";
import api from '@/axios/index.js';
import { getMetadata } from "../contract/TokenContract";
import { getQueryString, parseAmount } from "./util";
import { getTxData, storeAccessKey } from "./transaction";
import * as bs58 from 'bs58';



async function initViewAccount() {
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  const near = await nearAPI.connect({
    keyStore,
    ...store.state.nearConfig,
  });
  let viewAccount = await near.account();
  store.commit("setViewAccount", viewAccount)
}

async function resolveUrl() {
  const txs = getQueryString("transactionHashes") ? getQueryString("transactionHashes").split(",") : [];
  for (let tx of txs) {
    const txData = await getTxData(tx)
    const index = txData.transaction.actions.findIndex(item => !!item.AddKey)
    if (index > -1) {
      const functionCall = txData.transaction.actions[index].AddKey.access_key.permission.FunctionCall
      if (functionCall) {
        const contractId = functionCall.receiver_id
        const accountId = txData.transaction.receiver_id
        await storeAccessKey(accountId, contractId)
      }
      
    }
  }
}

async function initSignIn() {
  const account = store.state.walletConnection.account()
  // const keyPair = await account.connection.signer.keyStore.getKey(store.state.nearConfig.networkId, account.accountId)
  // const { authorizedApps } = await account.getAccountDetails()
  // console.log(authorizedApps)
  // const keys = authorizedApps.filter(item => 
  //   item.contractId == store.state.nearConfig.MAIN_CONTRACT && 
  //   item.publicKey == keyPair.getPublicKey().toString()
  //   //item.allowance > parseAmount(0.001)
  // )
  // if (keys.length == 0) {
  //   console.log(keys)
  //   return
  // }
  store.commit("setAccount", account)
  store.commit("setSignedIn", true)
  let res = await api.profile.get_user_info({accountId:store.getters.accountId})
  if (res.success) {
    store.commit("setProfile", res.data);
  }
  checkPostInfo();
}

async function initSenderWallet(keyStore, walletConnection) {
  if (typeof window.near !== 'undefined' && window.near.isSender) {
    console.log('Sender is installed!');

    const login = async () => {
      const account = window.near.account()
      if (!account) {
        return
      }
      const accountId = account.accountId
      const keyPair = await account.connection.signer.keyStore.getKey(store.state.nearConfig.networkId, accountId)
      await keyStore.setKey(store.state.nearConfig.networkId, accountId, keyPair)
      const authData = {
        accountId,
        allKeys: [keyPair.getPublicKey().toString()]
      }
      walletConnection._authData = authData
      window.localStorage.setItem("popula_wallet_auth_key", JSON.stringify(authData));
      await initSignIn()
    }

    if (!window.localStorage.getItem("popula_wallet_auth_key") && window.near.isSignedIn()) {
      await login()
    }

    // window.near.on("signIn", () => {history.go(0)})
    window.near.on("accountChanged", () => {history.go(0)})
    window.near.on("rpcChanged", (response) => {console.log(response)})

    window.near.on("signOut", async () => {
      await store.state.walletConnection.signOut()
      store.commit("setAccount", {})
      store.commit("setSignedIn", false)
    })
  }
}

async function checkPostInfo() {
  const postInfo = JSON.parse(localStorage.getItem("postInfo")) || [];
  const postList = [];
  for(let i = 0;i<postInfo.length;i++){
    const args = JSON.parse(bs58.decode(postInfo[i]).toString())['args'];
    const check_params = {
      ...args,
      account_id:store.getters.accountId
    }
    
    const recorded = await store.state.viewAccount.viewFunction(store.state.nearConfig.MAIN_CONTRACT, "check_viewed", check_params);
    if(!recorded){
      postList.push(postInfo[i]);
    }
  }
  localStorage.setItem("postInfo",JSON.stringify(postList));
}

export async function init() {
  store.commit("setNearConfig", getConfig()) //process.env.NODE_ENV === 'production' ? "mainnet" : "development"); 
  const providers = new nearAPI.providers.JsonRpcProvider(store.state.nearConfig.nodeUrl)
  store.commit("setProvider", providers)
  await initViewAccount()
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const near = await nearAPI.connect({
    keyStore: keyStore,
    ...store.state.nearConfig,
  });
  // 
  //store.commit("setNear", near);
  const walletConnection = new nearAPI.WalletConnection(near, "popula")
  store.commit("setWalletConnection", walletConnection);
  await initSenderWallet(keyStore, walletConnection)
  if (window.localStorage.getItem("popula_wallet_auth_key")) {
    initSignIn()
  }
  await resolveUrl()
};