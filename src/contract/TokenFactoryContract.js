import * as nearAPI from 'near-api-js';
import store from "@/store/index.js";
import { functionCall} from "near-api-js/lib/transaction.js";
import { signAndSendTransaction, getTxData } from '../utils/transaction';
import { generatePhrase, checkReceiptsSuccess, roundAmount } from '../utils/util';
import bs58 from "bs58";
import BN from 'bn.js';
import api from '@/axios/index.js';

export default class TokenFactoryContract {
    
    contract
    methods = {
        viewMethods: [
            'get_tokens', // mint
            'get_creator_tokens',  //creatortoken
            'get_token_info', //token
            'get_token_code_info', //
            'get_token_code_types', //
            'get_token_storage_cost', // token_types
        ],
        changeMethods: [
            'storage_deposit',
            'deploy_token'
        ]  // mint
    }

    getContractId() {
        return store.state.nearConfig.TOKEN_FACTORY
    }

    generateKeyPair(param) {
        return generatePhrase(`${param.name}`)
    }

    async getTokenInfo(token_id) {
        try {
            return await this.contract.get_token_info({token_id})
        } catch {
            console.log("error")
        }
        
    }

    async getDeposit(param) {
        const deposit = await this.contract.get_token_storage_cost({token_type: param.token_type});
        window.localStorage.setItem("deploy", JSON.stringify(param))
        const total_deposit = (new BN(deposit).add(new BN(param.args.length).mul(new BN(store.state.nearConfig.storageCostPerByte)))).toString()
        return roundAmount(total_deposit)
    }


    // async deposit(param) {
    //     const deposit = await this.getDeposit(param)
    //     await this.contract.storage_deposit({token_type: param.token_type, name: param.name}, '300000000000000', deposit)
    // }

    async deploy() {
        let param = JSON.parse(window.localStorage.getItem("deploy"))
        if (!param) {
            return false
        }


        const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
        const generatedKeyPair = this.generateKeyPair(param)
        const keyPair = nearAPI.KeyPair.fromString(generatedKeyPair.secretKey)

        await keyStore.setKey(store.state.nearConfig.networkId, this.getContractId(), keyPair);

        const near = await nearAPI.connect({
            // near
            keyStore: keyStore,
            ...store.state.nearConfig,
        });

        let account = await near.account(this.getContractId());

        let action = functionCall("deploy_token", {args: param.args}, '200000000000000', 0)
        let result = await signAndSendTransaction(this.getContractId(), account, [action])
        if (!checkReceiptsSuccess(result)) {
            return false
        }
        window.localStorage.removeItem("deploy")
        return result
    }

    constructor(account){
        this.contract = new nearAPI.Contract(account, this.getContractId(), {...this.methods, sender: account});
    }
}
