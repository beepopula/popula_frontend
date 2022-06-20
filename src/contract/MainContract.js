import * as nearAPI from 'near-api-js';
import { functionCall} from "near-api-js/lib/transaction.js";
import { signAndSendTransaction, getTxData } from '../utils/transaction';
import { checkReceiptsSuccess} from '../utils/util';
import store from "@/store/index.js";


export default class MainContract{
    contract
    methods = {
        viewMethods: [
            'check_viewd'
        ],
        changeMethods: [
            'add_content',
            'add_encrypt_content',
            'follow',
            'unfollow',
            'like',
            'unlike',
            'report',
            'del_content'
        ]  // mint
    }

    async _signAndSendTransaction(transaction) {
        const result = await signAndSendTransaction(this.contract.contractId, this.contract.account, transaction)
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
        return await this.contract.del_content(param)
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

    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}