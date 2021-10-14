// Color Helper

const d3_10color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
const color_brewer1 = ["#fbb4ae","#b3cde3", "#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"];
const color_brewer2 = ["#b3e2cd","#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc"];
const COLORS: string[] = [
    "#1A7AB1",
    "#ADC8E6",
    "#FF772D",
    "#FFB87F",
    "#2AA13A",
    "#98E090",
    "#FF9398",
    "#9467B9",
    "#C5B0D3",
    "#C49B95",
    "#E474C0",
    "#F7B4D1",
    "#BCBC3D",
    "#07C1CD"
    ]

const GREEN: string[] = [
    "#498B77",
    "#89C2AE",
    "#C1D6D3"
]
const BLUE: string[] = [
    "#3E97C7",
    "#72B3CF",
    "#8FCCDD",
    "#C8DADE"

]
const ORANGE: string[] = [
    "#E96206",
    "#F79143",
    "#F6AD76",
    "#F7CEA7"
]
const PINK: string[] = [
    "#F6B1C3",
    "#F07F93",
    "#DE4863",
    "#BC0F46"

]
const RED: string[] = ["#DC143C"];
const YELLOW : string[] = ['#fee08b'];
const GRAY: string[] = ['#999999'];
const getLinearColor = (ColorList: string[], step:number) => {
    let totalColor = ColorList.length;
    let divide = 1/ (totalColor - 1);
    let location = Math.floor(step / divide);
    if(location == totalColor - 1){
        location = location - 1;
    }
    let offset = step - location * divide;
    let adjusted_offset = offset / divide;
    return getGradientColor(ColorList[location], ColorList[location+1], adjusted_offset);
}
const getGradientColor = (startColor : string,endColor :string,step : number) => {
    let colorRgb = (sColor : string)=>{
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = sColor.toLowerCase();
        if(sColor && reg.test(sColor)){
            if(sColor.length === 4){
                var sColorNew = "#";
                for(var i=1; i<4; i+=1){
                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                }
                sColor = sColorNew;
            }
            var sColorChange = [];
            for(var i=1; i<7; i+=2){
                sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
            }
            return sColorChange;
        }else{
            return sColor;
        }
    };
    startColor = startColor.replace(/\s+/g,"");
    endColor = endColor.replace(/\s+/g,"");
    let startRGB : any = colorRgb(startColor);//转换为rgb数组模式
    //console.log(startRGB);
    let startR = startRGB[0];
    let startG = startRGB[1];
    let startB = startRGB[2];

    let endRGB : any = colorRgb(endColor);
    //console.log(endRGB);

    let endR = endRGB[0];
    let endG = endRGB[1];
    let endB = endRGB[2];
    if(step>1){
        console.log("out of range step: ", step);
        step = 1;
    }else if(step<0){
        console.log("out of range step: ", step);
        step = 0;
    }
    let sR = (endR-startR)*step;//总差值
    let sG = (endG-startG)*step;
    let sB = (endB-startB)*step;
    var R = parseInt((sR+startR));
    var G = parseInt((sG+startG));
    var B = parseInt((sB+startB));
    var strHex = "#";
    var aColor = new Array();
    aColor[0] = R;
    aColor[1] = G;
    aColor[2] = B;
    for(let j=0; j<3; j++){
        let hex : string = Number(aColor[j]).toString(16);
        let shex : string = Number(aColor[j])<10 ? '0'+hex :hex;
        if(shex === "0"){
            shex += shex;
        }
        strHex += shex;
    }
    return strHex;
}


const EChartsColor = [
    "#c23531",
    "#2f4554",
    "#61a0a8",
    "#d48265",
    "#91c7ae",
    "#749f83"
]

const DefaultColor = BLUE[1];
const StartColor = BLUE[0];
const EndColor = RED[0];
const getCoraNodeColor = ( node_label:number,color_encode:number = 2) =>{
    if(color_encode === 1 || color_encode === 2 || color_encode === 3){
        return d3_10color[node_label];
    }else if(color_encode === 5){
        if(node_label){
            return GREEN[0];
        }else{
            return RED[0];
        }
    }
    
}
const getCoraTextColor = (node_label:number) =>{
    if(node_label === 0){

        // Train
        return BLUE[0];
    }else{
        return GRAY[0];
    }
}

const getInfectionNodeColor = (show_mode:number, node_features:any, color_mode = 0) => {
    if(show_mode == 1){
        // Input Graph
        // Assume size of node_features  = 4
        if(node_features[0] == 1){
            // Sick
            return RED[0];
        }else if(node_features[0] == -1 && node_features[1] == -1){
            // Normal
            return BLUE[0];
        }else if(node_features[0] == -1 && node_features[1] == 1){
            // Immune
            return GREEN[0];
        }
    }else if (show_mode == 2){
        // Grouth Truth
        if(node_features[0] == 1){
            // Label : Sick
            return RED[0];
        }else if(node_features[0] == 0){
            // Label : Normal
            return BLUE[0];
        }
    }else if (show_mode == 3){
        // Model Output
        let value = (1/(1+Math.exp(-node_features[0])));
        return getLinearColor([StartColor,"#FFFFFF", EndColor], value);
    }else if(show_mode==4){
        // Explaination
        if(color_mode === 0){
            // LRP & Node Classification
            let value = (1/(1+Math.exp(-node_features)));
            return getLinearColor([StartColor,"#FFFFFF", EndColor], value);
        }else if(color_mode === 1){
            // SA / GBP 
            let value = node_features;
            if(value>1){
                console.log("Out of Range Value: ", value);
                value = 1;
            }else if(value < 0){
                console.log("Out of Range Value: ", value);
                value = 0;
            }
            return getLinearColor(["#FFFFFF", EndColor], value);
        }else if(color_mode === 2){
            // Graph Classification
            let value = node_features;
            if(value>1){
                console.log("Out of Range Value: ", value);
                value = 1;
            }else if(value < 0){
                console.log("Out of Range Value: ", value);
                value = 0;
            }
            return getLinearColor([StartColor,"#FFFFFF", EndColor], value);
        }
        
    }
    return DefaultColor;
}
const getInfectionEdgeColor = (show_mode:number, edge_features:any, color_mode =0 ) => {
    if(show_mode == 1 || show_mode == 2 || show_mode == 3){
        // Input Graph / Ground Truth / Model Output
        // Assume size of node_features  = 4
        if(edge_features[0] == 1){
            // Virtual
            return BLUE[2];
        }else if(edge_features[0] == -1){
            // Normal
            return GRAY[0];
        }
    }else if(show_mode==4){
        // Explaination
        //let value = (1/(1+Math.exp(-edge_features)));
        //return getLinearColor([StartColor,"#DDDDDD", EndColor], value);
        if(color_mode === 0){
            // LRP
            let value = (1/(1+Math.exp(-edge_features)));
            return getLinearColor([StartColor,"#DDDDDD", EndColor], value);
        }else if(color_mode === 1){
            // SA / GBP
            let value = edge_features;
            if(value>1){
                console.log("Out of Range Value: ", value);
                value = 1;
            }else if(value < 0){
                console.log("Out of Range Value: ", value);
                value = 0;
            }
            return getLinearColor(["#DDDDDD", EndColor], value);
        }
    }
    return DefaultColor;
}

// Transform Data Helper
function constructNeighborSet(graph_in:any){
    let senders = graph_in.senders;
    let receivers = graph_in.receivers;
    let node_num = graph_in.feature.length;
    let NeighborSet:any = {};
    for(let i = 0; i<node_num ;i++){
        NeighborSet[i] = [];
    }
    for(let i = 0; i< receivers.length; i++){
        let nowreceiver = receivers[i];
        if(nowreceiver in NeighborSet){
        }else{
            NeighborSet[nowreceiver] = []
        }
        NeighborSet[nowreceiver].push(senders[i]);
    }
    return NeighborSet;
}
function constructPathDict(message_passing:any){
    let senders = message_passing.senders;
    let receivers = message_passing.receivers;
    let values = message_passing.values;
    let PathDict:any = {};
    for(let i = 0; i< receivers.length; i++){
        let nowreceiver = receivers[i];
        if(nowreceiver in PathDict){
        }else{
            PathDict[nowreceiver] = {}
        }
        PathDict[nowreceiver][senders[i]] = values[i];
    }
    return PathDict;
}
function getTrainColor(node_id:any, train_set:any){
    if(train_set.has(node_id)){
        //return "#fff";
        return "#000";
    }else{
        return "#fff";
    }
}
function getNodeStatisticStr(selectedNodeLength: number, totalNodeLength: number){
    let str : string = "" + selectedNodeLength + "/"+ totalNodeLength;
    let percentage : number ;
    if(totalNodeLength === 0){

    }else{
        percentage = selectedNodeLength / totalNodeLength * 100;
        str = str + " (" + percentage.toFixed(2) +"%)"
    }
    return str;
}
const plainOptions = ['Train', 'Valid', 'Test','Others'];
const defaultCheckedList = ['Train', 'Valid', 'Test', 'Others'];
function getInspectCategoryOptions(){
    return plainOptions;
}
function getDefaultInspectCategoryOptions(){
    return defaultCheckedList;
}

function compareSelectedNodeIdList(list_a:any, list_b:any){
    if(list_a.length === list_b.length){
        for(let i = 0; i<list_a.length; i++){
            if(list_a[i] === list_b[i]){

            }else{
                return false;
            }
        }
        return true;
    }else{
        return false;
    }
}
function cropAnchorsList(anchors_list:any, K_value:any){
    anchors_list.sort((a:any,b:any)=>{
        if(a.anchor_similarity>b.anchor_similarity){
            return -1;
        }else{
            return 1;
        }
    })
    if(K_value<1){
        K_value = 1;
    }
    if(K_value > anchors_list.length){
        K_value = anchors_list.length;
    }
    anchors_list = anchors_list.slice(0,K_value);
    return anchors_list;
}

function calculateFeatureSimilarity(feature1:any, feature2:any){
    let len1 = feature1.length;
    let len2 = feature2.length;
    let common = 0;
    for(let k = 0; k<len1; k++){
        if(feature2.indexOf(feature1[k])>=0){
            common = common + 1;
        }
    }
    let total_length = len1+len2 - common;
    if(total_length === 0){
        return 0;
    }else{
        return common / total_length; 
    }
}

function calculateCosSimilarity(feature1:any, feature1_value:any, feature2:any, feature2_value:any){
    let len1 = feature1.length;
    let len2 = feature2.length;
    let common = 0;
    let norm_1 = 0;
    let norm_2 = 0;
    let eps = 1e-8;
    for(let k = 0; k<len1; k++){
        let idx2 = feature2.indexOf(feature1[k]);
        if(idx2>=0){
            common = common + feature1_value[k]*feature2_value[idx2];
        }
        norm_1 = norm_1 + feature1_value[k]*feature1_value[k];
    }
    for(let k = 0; k<len2; k++){
        norm_2 = norm_2 + feature2_value[k]*feature2_value[k];
    }
    norm_1 = Math.sqrt(norm_1);
    norm_2 = Math.sqrt(norm_2);
    if(norm_1<eps){
        norm_1 = eps;
    }
    if(norm_2<eps){
        norm_2 = eps;
    }
    let cos = common / (norm_1 * norm_2);
    if(cos>=1){
        cos = 1;
    }else if(cos<0){
        cos = 0;
    }
    return cos;
    
}

function getSimilarityFeatureSet(node_list:any, anchor_list:any, feature_list:any, feature_value_list:any, label_list:any, k:number=5){
    let feature_similarity_list:any = {};
    //console.log("getF ", feature_list, feature_list.length);
    for(let i = 0; i<node_list.length; i++){
        let max_feature_similarity = 0;
        let max_anchor_set = [];
        let all_anchor_similarity_list:any = [];
        for(let j = 0; j<anchor_list.length; j++){
            let idx_1 = node_list[i];
            let idx_2 = anchor_list[j];
            let feature_sim = calculateCosSimilarity(feature_list[idx_1], feature_value_list[idx_1], feature_list[idx_2], feature_value_list[idx_2]);
            if(feature_sim > max_feature_similarity){
                max_feature_similarity = feature_sim;
                max_anchor_set = [anchor_list[j]];
            }else if(feature_sim === max_feature_similarity){
                max_anchor_set.push(anchor_list[j]);
            }
            all_anchor_similarity_list.push({
                "anchor_id":idx_2,
                "anchor_label":label_list[idx_2],
                "anchor_similarity":feature_sim
            })
        }
        all_anchor_similarity_list = all_anchor_similarity_list.sort((a:any,b:any)=>{
            return a.anchor_similarity > b.anchor_similarity ? -1:1;
        })
        let topk_anchor_similarity_list = all_anchor_similarity_list.slice(0,k);
        feature_similarity_list[""+node_list[i]] = {
            "feature_similarity":max_feature_similarity,
            "feature_sim_set":max_anchor_set,
            "topk_anchor_similarity_list":topk_anchor_similarity_list
        }
    }
    return feature_similarity_list;
}



function getShortestPathDistanceSet(node_list:any, node_num:number,  neighbor_set:any, anchor_list:any){
    console.log("getShortestPathDistanceSet begin anchor_list.length", anchor_list.length);
    let shortest_path_list:any = {};
    let anchor_set = new Set(anchor_list);
    //console.log("anchor_set", anchor_set);
    for(let i = 0 ;i < node_list.length; i++){
        let queue = [];
        queue.push([node_list[i], 0]);
        let shortest_path_distance:any = "inf";
        let shortest_path_set : any = [];
        let mask = new Array(node_num).fill(0);
        //console.log("mask", mask);
        while(queue.length > 0){
            let curr:any = queue.shift();
            if(mask[curr[0]]){
                continue;
            }
            mask[curr[0]] = 1;
            if(anchor_set.has(curr[0])){
                //console.log("discoverd", curr[0]);
                if(shortest_path_distance === "inf"){
                    shortest_path_distance = curr[1];
                    shortest_path_set.push(curr[0]);
                }else if(shortest_path_distance === curr[1]){
                    shortest_path_set.push(curr[0]);

                }else{
                    break;
                }
            }else{
                let neighbors = neighbor_set[curr[0]];
                for(let j = 0; j <neighbors.length; j++){
                    if(!mask[neighbors[j]]){
                        queue.push([neighbors[j], curr[1]+1]);

                    }
                }
            }
        }
        shortest_path_list[""+node_list[i]] = {
            "shortest_path_distance":shortest_path_distance,
            "shortest_path_set":shortest_path_set
        }
        //break;

    }
    console.log("getShortestPathDistanceSet end");
    return shortest_path_list;
}

function updateCNtable(cn_table:any, cgt:any, cpt:any, ngt: any, npt:any){
    if(cgt === ngt){
        cn_table["cgt_ngt"] = cn_table["cgt_ngt"] + 1;
    }
    if(cgt === npt){
        cn_table["cgt_npt"] = cn_table["cgt_npt"] + 1;
    }
    if(cpt === ngt){
        cn_table["cpt_ngt"] = cn_table["cpt_ngt"] + 1;
    }
    if(cpt === npt){
        cn_table["cpt_npt"] = cn_table["cpt_npt"] + 1;
    }
    return cn_table;
}

function constructMetaInformation(node_num:number, NeighborSet:any,graph_target:any, graph_out:any){
    let degree_list = [];
    let one_hop_accuracy_list = [];
    let cn_consistency_list = [];
    
    for(let i = 0; i < node_num; i++) {
        let degree = 0;
        let one_hop_accuracy = 0;
        let center_node_gt = graph_target[i];
        let center_node_pt = graph_out[i];
        let cn = {
            "cgt_npt":0,
            "cgt_ngt":0,
            "cpt_npt":0,
            "cpt_ngt":0
        }
        if(i in NeighborSet){
            degree = NeighborSet[i].length;
            let correctnum = 0;
            for(let j = 0; j < degree; j ++){
                let nownode = NeighborSet[i][j];
                if(graph_target[nownode] === graph_out[nownode]){
                    correctnum = correctnum + 1;
                }
                cn = updateCNtable(cn,center_node_gt, center_node_pt, graph_target[nownode], graph_out[nownode]);
            }
            if(degree === 0){
                one_hop_accuracy = 0;
                cn["cgt_ngt"] = 0;
                cn["cgt_npt"] = 0;
                cn["cpt_ngt"] = 0;
                cn["cpt_npt"] = 0;
            }else{
                one_hop_accuracy = correctnum / degree;
                cn["cgt_ngt"] = cn["cgt_ngt"] / degree;
                cn["cgt_npt"] = cn["cgt_npt"] / degree;
                cn["cpt_ngt"] = cn["cpt_ngt"] / degree;
                cn["cpt_npt"] = cn["cpt_npt"] / degree;
            }
            
            
        }

        degree_list.push(degree);
        one_hop_accuracy_list.push(one_hop_accuracy);
        cn_consistency_list.push(cn);
    }
    return {
        "degree_list": degree_list,
        "one_hop_accuracy_list":one_hop_accuracy_list,
        "cn_consistency_list":cn_consistency_list
    }
}

function constructSelectedMask(node_num:number,CheckedList:any, mask:any){
            
    let train_mask = mask.train;
    let test_mask = mask.test;
    let valid_mask=  mask.valid;
    let all_mask = [...train_mask,...test_mask,...valid_mask];
    let other_mask = [];
    for(let i = 0; i < node_num; i++){
        if(all_mask.indexOf(i)>=0){

        }else{
            other_mask.push(i);
        }
    }
    let selected_mask:any[] = [];
    //console.log("Train",CheckedList,CheckedList.indexOf("Train")>=0);
    if(CheckedList.indexOf("Train")>=0){
        selected_mask = selected_mask.concat(train_mask);
    }
    if(CheckedList.indexOf("Test")>=0){
        selected_mask = selected_mask.concat(test_mask);
    }

    if(CheckedList.indexOf("Valid")>=0){
        selected_mask = selected_mask.concat(valid_mask);
    }

    if(CheckedList.indexOf("Others")>=0){
        selected_mask = selected_mask.concat(other_mask);
    }
    //selected_mask.sort();
    return selected_mask;

}
/*
function constructRange(data_list:any){
    let range:any = [];
    for(let i =0 ;i <data_list.length; i++){
        if(range.indexOf(data_list)>=0){

        }else{
            range.push(data_list[i]);
        }
    }
    range.sort();
    return range;
}*/

function normalized(array:any){
    var total = 0;
    for(let i = 0 ; i < array.length; i++){
        total = total + array[i];
    }
    if(total === 0){
        return array;
    }else{
        for(let i = 0 ;i<array.length; i++){
            array[i] = array[i] / total;
        }
        return array;
    }
    
}
function getLabelDistribution(node_list:any, total_label:any, num_classes:any){
    let node_info = new Array(num_classes).fill(0);
    //let mfs_set = feature_similarity_list[""+index].feature_sim_set;
    for(let j = 0; j<node_list.length; j++){
        let label = total_label[node_list[j]];
        node_info[label] = node_info[label] + 1;
    }
    return normalized(node_info);
}
function getLabelDistribution2(node_list:any, num_classes:any){
    let node_info = new Array(num_classes).fill(0);
    //let mfs_set = feature_similarity_list[""+index].feature_sim_set;
    for(let j = 0; j<node_list.length; j++){
        let label = node_list[j].anchor_label;
        node_info[label] = node_info[label] + 1;
    }
    return normalized(node_info);
}

function getNodeColorInfo(index:number,graph_target:any, individual:any, selected_models_list:any, train_mask_set:any){
    let ground_truth_label = graph_target.node_features[index];
    //let label = ground_truth_label;
    let color = [];
    color.push(getCoraNodeColor(ground_truth_label, 2));
    for(let i = 0; i<selected_models_list.length; i++){
        color.push(getCoraNodeColor(individual[selected_models_list[i]].graph_out.node_features[index]))
    }
    color.push(getTrainColor(index, train_mask_set));
    return color;
}

function addRange(a:any,b:any){
    if(a["active"]){
        if(a["end"]<b["start"]){
            return {
                "active":true,
                "start":a["start"],
                "end":b["end"],
                "count":a["count"]+b["count"]
            }
        }else{
            console.log("invalid added");
            return {
                "active":false
            }
        }
        
    }else{
        if(b["active"]){
            return b;
        }else{
            console.log("inactive added");
            return {
                "active":false
            }
        }
    }
}

function binningContinuousVariable(continuous_variable_list:any, bucket_num:number=8){
    let nodenum = continuous_variable_list.length;
    let distribution:any = {};
    for(let i = 0; i<nodenum; i++){
        if(distribution[continuous_variable_list[i]]){
            distribution[continuous_variable_list[i]] = distribution[continuous_variable_list[i]]+1;

        }else{
            distribution[continuous_variable_list[i]] = 1;
        }
    }
    let key:any = Object.keys(distribution);
    let new_key:any = [];
    for(let i = 0; i<key.length; i++){
        new_key.push(parseFloat(key[i]));
    }
    let compare_number = (a:number, b:number)=>{
        return a-b;
    }
    new_key = new_key.sort(compare_number);
    //console.log(new_degree_key);
    let range_list = [];
    let prev_range = {
        "active":false
    }
    let current_range:any = {
        "active":false
    }

    let single_bucket_count = nodenum / bucket_num;
    for(let i = 0; i<new_key.length; i++){
        let this_range = {
            "active":true,
            "start":new_key[i],
            "end":new_key[i],
            "count":distribution[new_key[i]]
        }
        
        current_range = addRange(prev_range, this_range);
        //console.log(i, prev_range, this_range, current_range);
        // Assume result range is active
        if(current_range["active"]){
            if(current_range["count"]<single_bucket_count){
                if(i === key.length-1){
                    range_list.push(current_range);
                    current_range = {
                        "active":false
                    }
                }
            }else if(current_range["count"]>=2*single_bucket_count){
                if(prev_range["active"]){
                    range_list.push(prev_range);
                }
                range_list.push(this_range);
                current_range = {
                    "active":false
                }
            }else{
                range_list.push(current_range);
                current_range = {
                    "active":false
                }
            }
            prev_range = Object.assign({}, current_range);
        }
    }
    for(let i = 0; i<range_list.length; i++){
        let start = range_list[i]["start"];
        let end = range_list[i]["end"];
        if(start === end){
            range_list[i]["name"] = ""+end;
        }else{
            range_list[i]["name"] = "["+start.toFixed(2)+","+end.toFixed(2)+"]";
        }
    }
    return range_list;
}

function getContinuousVariableCategory(value:number, value_list:any){
    for(let i = 0; i<value_list.length; i++){
        let start = value_list[i]["start"];
        let end = value_list[i]["end"];
        //console.log(degree, start, end);
        if(value>=start && value<=end){
            return value_list[i]["name"];
        }
    }
    return ""+value;
}
function constructDegreeRangeList(degree_list:any, bucket_num:number=8){
    let nodenum = degree_list.length;
    let degree_distribution:any = {};
    for(let i = 0; i<nodenum; i++){
        if(degree_distribution[degree_list[i]]){
            degree_distribution[degree_list[i]] = degree_distribution[degree_list[i]]+1;

        }else{
            degree_distribution[degree_list[i]] = 1;
        }
    }
    let degree_key:any = Object.keys(degree_distribution);
    let new_degree_key:any = [];
    for(let i = 0; i<degree_key.length; i++){
        new_degree_key.push(parseInt(degree_key[i]));
    }
    let compare_number = (a:number, b:number)=>{
        return a-b;
    }
    new_degree_key = new_degree_key.sort(compare_number);
    //console.log(new_degree_key);
    let degree_range_list = [];
    let prev_range = {
        "active":false
    }
    let current_range:any = {
        "active":false
    }

    let single_bucket_count = nodenum / bucket_num;
    for(let i = 0; i<new_degree_key.length; i++){
        let this_range = {
            "active":true,
            "start":new_degree_key[i],
            "end":new_degree_key[i],
            "count":degree_distribution[new_degree_key[i]]
        }
        
        current_range = addRange(prev_range, this_range);
        //console.log(i, prev_range, this_range, current_range);
        // Assume result range is active
        if(current_range["active"]){
            if(current_range["count"]<single_bucket_count){
                if(i === degree_key.length-1){
                    degree_range_list.push(current_range);
                    current_range = {
                        "active":false
                    }
                }
            }else if(current_range["count"]>=2*single_bucket_count){
                if(prev_range["active"]){
                    degree_range_list.push(prev_range);
                }
                degree_range_list.push(this_range);
                current_range = {
                    "active":false
                }
            }else{
                degree_range_list.push(current_range);
                current_range = {
                    "active":false
                }
            }
            prev_range = Object.assign({}, current_range);
        }
    }
    for(let i = 0; i<degree_range_list.length; i++){
        let start = degree_range_list[i]["start"];
        let end = degree_range_list[i]["end"];
        if(start === end){
            degree_range_list[i]["name"] = ""+end;
        }else{
            degree_range_list[i]["name"] = "["+start+","+end+"]";
        }
    }
    return degree_range_list;
}
function getDegreeCategory(degree:number, degree_list:any){
    for(let i = 0; i<degree_list.length; i++){
        let start = degree_list[i]["start"];
        let end = degree_list[i]["end"];
        //console.log(degree, start, end);
        if(degree>=start && degree<=end){
            return degree_list[i]["name"];
        }
    }
    return ""+degree;
}
function getMaxComponent(label_list:any){
    let max_index_list:any = [];
    let max_value = 0;
    for(let i = 0; i<label_list.length; i++){
        if(i==0){
            max_value = label_list[i];
            max_index_list.push(i);
        }else{
            if(label_list[i]>max_value){
                max_value = label_list[i];
                max_index_list = [i]
            }else if(label_list[i]==max_value){
                max_index_list.push(i);
            }
        }
        
    }
    if(max_index_list.length>=2){
        return -1;
    }else{
        return max_index_list[0];
    }
}

function get_boundingbox(graph_layout:any[]){
    if(graph_layout.length === 0){
        return {
            "xmin":0,
            "xmax":0,
            "ymin":0,
            "ymax":0
        }
    }else{
        let xmin = graph_layout[0][0];
        let xmax = graph_layout[0][0];
        let ymin = graph_layout[0][1];
        let ymax = graph_layout[0][1];
        for(let i = 0; i< graph_layout.length; i++){
            let nowx = graph_layout[i][0];
            let nowy = graph_layout[i][1];
            if(xmin > nowx){
                xmin = nowx;
            }
            if(xmax < nowx){
                xmax = nowx;
            }
            if(ymin > nowy){
                ymin = nowy;
            }
            if(ymax < nowy){
                ymax = nowy;
            }
        }
        return {
            "xmin":xmin,
            "xmax":xmax,
            "ymin":ymin,
            "ymax":ymax
        }
    }
}

function transform_graphlayout(graph_layout:any[], width:number, height:number){
    if(graph_layout.length === 0){
        return graph_layout;
    }else{
        let bounding_box = get_boundingbox(graph_layout);
        let margin = 20;
        if(graph_layout.length >= 100){
            margin = 20;
        }
        
        let realwidth = width - 2*margin;
        let realheight = height - 2*margin;
        let gap_x = bounding_box["xmax"] - bounding_box["xmin"];
        let gap_y = bounding_box["ymax"] - bounding_box["ymin"];
        if(gap_x === 0){
            gap_x = 1e-16;
        }
        if(gap_y === 0){
            gap_y = 1e-16;
        }
        let realscale = Math.min(realwidth / gap_x, realheight / gap_y);
        let left = margin + (realwidth - realscale * gap_x) / 2;
        let top = margin + (realheight - realscale * gap_y) / 2; 
        let xmin = bounding_box["xmin"];
        let ymin = bounding_box["ymin"];
        let new_graph_layout = [];
        for(let i = 0; i< graph_layout.length; i++){
            let nowx = graph_layout[i][0];
            let nowy = graph_layout[i][1];
            let locx = left+ (nowx - xmin) * realscale;
            let locy = top + (nowy - ymin) * realscale;
            new_graph_layout.push([locx,locy]);
        }
        return new_graph_layout;
    }
}
function skew_weight(weight:any, range_min:any=0.1, range_max:any=1){
    // Assume weight is [0,1]
    return (weight - 0) * 0.9 + range_min;
}
function getLayoutMode(){
    // 1 ---> Graph View In Center
    // 2 ---> Parallel Coordinates in Row
    // 3 ---> Only Graph View
    return 3;
}

export { RED,YELLOW, EChartsColor, getInfectionNodeColor,
     getInfectionEdgeColor, getCoraNodeColor,getCoraTextColor,
     constructNeighborSet, getLayoutMode, constructPathDict,getTrainColor,
     getInspectCategoryOptions, getDefaultInspectCategoryOptions, 
     compareSelectedNodeIdList, getNodeStatisticStr, cropAnchorsList,
     getLabelDistribution, getLabelDistribution2, getSimilarityFeatureSet,
      getShortestPathDistanceSet, constructMetaInformation, constructSelectedMask,
      getNodeColorInfo, constructDegreeRangeList, getDegreeCategory, 
      binningContinuousVariable, getContinuousVariableCategory, getMaxComponent,
      transform_graphlayout, skew_weight }
