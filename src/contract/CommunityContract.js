import * as nearAPI from 'near-api-js';
import { functionCall, addKey } from "near-api-js/lib/transaction.js";
import { signAndSendTransaction, getTxData, executeMultipleTransactions, generateAccessKey } from '../utils/transaction';
import { checkReceiptsSuccess} from '../utils/util';
import store from "@/store/index.js";
import bs58 from "bs58";


export default class CommunityContract{
    contract
    isSignedIn
    methods = {
        viewMethods: [
        ],
        changeMethods: [
            'set_access',
            'add_content',
            'add_encrypt_content',
            'like',
            'unlike',
            'report',
            'del_content'
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        if (!this.isSignedIn) {
            const accessKey = await generateAccessKey(store.getters.accountId, this.contract.contractId)
            const txs = [{
                receiverId: this.contract.contractId,
                actions: [{
                    kind: "functionCall",
                    ...transaction
                }]
            }, {
                receiverId: store.getters.accountId,
                actions: [{
                    kind: "addKey",
                    publicKey: accessKey.publicKey,
                    accessKey: accessKey.accessKey
                }]
            }]
            const result = await executeMultipleTransactions(this.contract.account, txs)
            //TODO checkResult
        } else {
            const result = await signAndSendTransaction(this.contract.contractId, this.contract.account, transaction)
            if (!checkReceiptsSuccess(result)) {
                return false
            }
            return true
        }
        
        
    }

    async addContent(param) {
        const transaction = {
            methodName: "add_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async addEncryptContent(param) {
        const transaction = {
            methodName: "add_encrypt_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async report(param){
        const transaction = {
            methodName: "report",
            args: param,
            deposit: "5000000000000000000000000",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async delContent(param){
        const transaction = {
            methodName: "del_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async like(param){
        const transaction = {
            methodName: "like",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async unlike(param){
        const transaction = {
            methodName: "unlike",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }
    


    constructor(contractId, near){
        const wallet = new nearAPI.WalletConnection(near, contractId)
        const account = wallet.account()
        this.isSignedIn = wallet.isSignedIn() && store.getters.accountId == account.accountId
        this.contract = new nearAPI.Contract(account, contractId, {...this.methods, sender: account});
    }

    static async new(contractId) {
        const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore(window.localStorage, contractId);
        const near = await nearAPI.connect({
            keyStore: keyStore,
            ...store.state.nearConfig,
        });
        return new CommunityContract(contractId, near)
    }
}

