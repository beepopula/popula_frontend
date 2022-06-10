import * as nearAPI from 'near-api-js';
import { functionCall} from "near-api-js/lib/transaction.js";
import { signAndSendTransaction, getTxData } from '../utils/transaction';
import { checkReceiptsSuccess} from '../utils/util';
import store from "@/store/index.js";


export default class MainContract{
    contract
    methods = {
        viewMethods: [
        ],
        changeMethods: [
            'add_content',
            'add_encrypt_content',
            'add_post',
            'add_comment',
            'follow',
            'unfollow',
            'like',
            'unlike',
            'report'
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        const actions = [functionCall(transaction.methodName, transaction.args, transaction.gas)]
        const result = await signAndSendTransaction(this.contract.contractId, this.contract.account, actions)
        if (!checkReceiptsSuccess(result)) {
            return false
        }
        return true
    }

    getContractId(){
        return store.state.nearConfig.MAIN_CONTRACT
    }


    async addContent(param,account) {
        const transaction = {
            methodName: "add_content",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async addPost(param,account) {
        const transaction = {
            methodName: "add_post",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        };
        return await this._signAndSendTransaction(transaction)
    }

    async addComment(param,account) {
        const transaction = {
            methodName: "add_comment",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
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

    async addEncryptPost(param) {
        const transaction = {
            methodName: "add_encrypt_post",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async addEncryptComment(param) {
        const transaction = {
            methodName: "add_encrypt_comment",
            args: param,
            deposit: "0",
            gas: "100000000000000"
        }
        return await this._signAndSendTransaction(transaction)
    }

    async follow(param){
        return await this.contract.follow(param)
    }

    async unfollow(param){
        return await this.contract.unfollow(param)
    }

    async like(param){
        return await this.contract.like(param)
    }

    async unlike(param){
        return await this.contract.unlike(param)
    }

    async report(param){
        return await this.contract.report(param)
    }

    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}