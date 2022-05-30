//import * as AWS from "aws-sdk";
import axios from "axios";
import stringRandom from "string-random"
import store from "../store";
import { getAccountSign } from "./util";
import js_sha256 from 'js-sha256';
import fetch from './fetch.js'

export async function upload(file) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  let fileBase64 = await new Promise((resolve, reject) => {
    reader.onload = function (e) {
      resolve(e.target.result)
    };
  })
  
  let params = {
      args: {
        hash: js_sha256.sha256(fileBase64)
      },
      account_id: store.getters.accountId
  }
  params.sign = await getAccountSign(params.args)
  const formData = new FormData();
  formData.append('files',file)
  formData.append('args', JSON.stringify(params))
  let res = await fetch(`${store.state.nearConfig.IPFS}/upload`, {
    body: formData,
    method: 'POST',
  })
  return `${store.state.nearConfig.IPFS}/ipfs/${res.data[0]}`
}