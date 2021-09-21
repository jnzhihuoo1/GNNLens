import axios from 'axios';
//const URL = 'http://192.168.245.1:3000/';
//var url1 = window.location.href;
//var url3 = document.URL;
//const URL = document.location.origin;
//const URL = "http://localhost:7777"
//const obj = require("gzip-loader!file.js.gz");
//console.log("public obj", obj);
const ENABLE_STATIC_JSON = false;
const VERSION = "V1_2";
const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:7777'
    : window.location.origin;
const axiosInstance1 = axios.create({
    baseURL: `${URL}/api/`,
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

const URL2 = window.location.origin;
const axiosInstance2 = axios.create({
    baseURL: `${URL2}/data/`,
    // timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

let axiosInstance = (ENABLE_STATIC_JSON)?axiosInstance2:axiosInstance1;
/*function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }*/
export async function getDatasetList(): Promise<any> {
    let url = `/datasets`;
    if(ENABLE_STATIC_JSON){
        url = '/datasetlist_'+VERSION+".json";
    }
    //const params = { classifier_start, classifier_end };
    const res = await axiosInstance.get(url);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
export async function getExplainMethodsList(model_id:number): Promise<any> {
    const url = `/explainMethods`;
    const params = { model_id };
    const res = await axiosInstance.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
  export async function getModelList(dataset_id:number): Promise<any> {
    const url = `/models`;
    const params = { dataset_id };
    const res = await axiosInstance.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
export async function getGraphList(dataset_id:number): Promise<any> {
    const url = `/graphs`;
    const params = { dataset_id };
    const res = await axiosInstance.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
export async function getGraphInfo(dataset_id:number, model_id:number, explain_id:number, graph_id:number): Promise<any> {
    const url = `/graph_info`;
    const params = { dataset_id, model_id, explain_id, graph_id };
    const res = await axiosInstance.get(url, {params});
    if (res.status === 200) {
        return res.data;
    }
    throw res;
}
export async function getGraphBundledInfo(dataset_id:number): Promise<any> {
    if(ENABLE_STATIC_JSON){
        const url = '/cache_bundle_'+dataset_id+'_'+VERSION+".json";
        const res = await axiosInstance.get(url);
        if (res.status === 200) {
            return res.data;
        }
        throw res;
    }else{
        const url = `/graph_bundle_info`;
        const params = { dataset_id};
        const res = await axiosInstance.get(url, {params});
        if (res.status === 200) {
            return res.data;
        }
        throw res;
    }
    
}

export async function getRulesInfo(dataset_id:number): Promise<any> {
    if(ENABLE_STATIC_JSON){
        /*const url = '/cache_bundle_'+dataset_id+'_'+VERSION+".json";
        const res = await axiosInstance.get(url);
        if (res.status === 200) {
            return res.data;
        }
        throw res;*/
    }else{
        const url = `/rule_mining`;
        const params = { dataset_id};
        const res = await axiosInstance.get(url, {params});
        if (res.status === 200) {
            return res.data;
        }
        throw res;
    }
    
}