import * as nearAPI from 'near-api-js';
import store from "@/store/index.js";


export default class EncryptionContract{
    contract
    methods = {
        viewMethods: [
            'encrypt',
            'decrypt'
        ],
        changeMethods: [
        ]  // mint
    }

    getContractId(){
        return store.state.nearConfig.ENCRYPTION_CONTRACT
    }

    async encrypt(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'encrypt', param);
    }

    async decrypt(param){
        return await store.state.viewAccount.viewFunction(this.getContractId(), 'decrypt', param);
    }

    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}