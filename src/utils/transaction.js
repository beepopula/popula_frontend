import getConfig from "@/config";
import { KeyPair, keyStores, connect } from 'near-api-js';
import { getDeposit, getGas,formatAmount, parseAmount } from "@/utils/util"
import * as transaction from "near-api-js/lib/transaction.js";
import { PublicKey } from 'near-api-js/lib/utils';
import { baseDecode, serialize } from 'borsh';
import store from "@/store/index.js";
import BN from 'bn.js';


async function createTransaction({receiverId,actions,nonceOffset = 1}) {
  
  if (store.getters.loginWallet == "sender") {
    actions = actions.map((fc) => {
      if (fc.kind == "functionCall") {
        return {
          kind: fc.kind,
          methodName: fc.methodName,
          args: fc.args,
          gas: fc.gas,
          deposit: fc.deposit
        }
      } else if (fc.kind == "addKey") {
        return {
          kind: fc.kind,
          args: {
            publicKey: fc.publicKey.toString(),
            accessKey: {
              nonce: fc.accessKey.nonce,
              permission: {
                FunctionCall: {
                  allowance: fc.accessKey.permission.functionCall.allowance,
                  receiverId: fc.accessKey.permission.functionCall.receiverId,
                  methodNames: fc.accessKey.permission.functionCall.methodNames
                }
              }
            }
          },
        }
      }
    })
    return {
      receiverId: receiverId,
      actions
    }
  }

  actions = actions.map((fc) => {
    if (fc.kind == "functionCall") {
      return transaction.functionCall(
        fc.methodName,
        fc.args,
        getGas(fc.gas),
        getDeposit(fc.deposit)
      )
    } else if (fc.kind == "addKey") {
      return transaction.addKey(
        fc.publicKey,
        fc.accessKey
      )
    }
  })

  

  const localKey = await store.state.account.connection.signer.getPublicKey(
    store.getters.accountId,
    store.state.nearConfig.networkId
  );
  let accessKey = await store.state.account.accessKeyForTransaction(
    receiverId,
    actions,
    localKey
  );
  if (!accessKey) {
    throw new Error(
      `Cannot find matching key for transaction sent to ${receiverId}`
    );
    
    
  } else {
    const block = await store.state.provider.block({ finality: 'final' });
    const blockHash = baseDecode(block.header.hash);
  
    const publicKey = PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;
  
    return transaction.createTransaction(
      store.getters.accountId,
      publicKey,
      receiverId,
      nonce,
      actions,
      blockHash
    );
  }
}

export async function signAndSendTransaction(contractId, account, actions) {
  return await account.signAndSendTransaction({receiverId: contractId, actions: actions})
}

export async function getTxData(hash) {
  let result = await store.state.provider.sendJsonRpc("EXPERIMENTAL_tx_status", [hash, store.getters.accountId]);
  return result
}

export async function getReceiptState(receipt_id) {
  const result = await store.state.provider.sendJsonRpc("EXPERIMENTAL_receipt", { "receipt_id":receipt_id });
  return result
}

export async function getTotalSpend(result) {
  let total = new BN(0);
  for(let i =0;i<result.length;i++){
    const res = result[i];
    for(let j =0;j<res.receipts_outcome.length;j++){
      const receipt = res.receipts_outcome[j];
      total = total.add(new BN(receipt.outcome.tokens_burnt));
    }
  } 
  total= formatAmount(total.toString(10),24,2);   
  return total;
}

export async function executeMultipleTransactions(
    account,
    transactions,
    callbackUrl
  ) {
    const nearTransactions = await Promise.all(
      transactions.map((t, i) => {
        return createTransaction({
          receiverId: t.receiverId,
          nonceOffset: i + 1,
          actions: t.actions
          
        });
      })
    );
    if (store.getters.loginWallet == "sender") {
      return await window.near.requestSignTransactions({ transactions: nearTransactions });
    } 
    return store.state.walletConnection.requestSignTransactions(nearTransactions, callbackUrl);
  };

export async function generateAccessKey(accountId, contractId) {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, contractId);
  const keyPair = KeyPair.fromRandom("ed25519")
  await keyStore.setKey(store.state.nearConfig.networkId, "pending::" + accountId, keyPair);
  return {
    publicKey: keyPair.getPublicKey(),
    accessKey: transaction.functionCallAccessKey(contractId, [], parseAmount(0.25)),
  }
}

export async function storeAccessKey(accountId, contractId) {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore(window.localStorage, contractId);
  const keyPair = await keyStore.getKey(store.state.nearConfig.networkId, "pending::" + accountId)
  if (!keyPair) {
    return
  }
  const authDataKey = contractId + '_wallet_auth_key';
  const authData = {
      accountId,
      allKeys: [keyPair.getPublicKey().toString()]
  };
  window.localStorage.setItem(authDataKey, JSON.stringify(authData));
  await keyStore.setKey(store.state.nearConfig.networkId, accountId, keyPair)
  await keyStore.removeKey(store.state.nearConfig.networkId, "pending::" + accountId)
}