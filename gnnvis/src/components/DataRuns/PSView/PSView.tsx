
import * as React from "react";
import ParallelSetsContainer from '../../../container/ParallelSetsContainer';
import PSViewNodeStatisticContainer from '../../../container/PSViewNodeStatisticContainer';
import { Row , Button} from 'antd';
import {constructNeighborSet,getLayoutMode,getCoraNodeColor,getTrainColor, compareSelectedNodeIdList} from '../../../helper';
import PSSettingsModalContainer from "../../../container/PSSettingsModalContainer";
import { getConfigFileParsingDiagnostics } from "typescript";
import { SettingOutlined } from '@ant-design/icons';




export interface IProps {
    graph_object:any,
    show_mode:number, 
    explained_node:number, 
    onExplainNodeChange:any, 
    onShowModeChange:any,
    model:number,
    modelList:any[],
    width:number,
    height:number,
    checkedList:any[],
    changePSJson:any,
    changePSSettingsModal_visible:any,
    changePSDimensions:any
}
export interface IState {

}

export default class PSView extends React.Component<IProps, IState>{
    public prev_bundle_id = -1;
    constructor(props:IProps) {
        super(props);
        this.state = {
           
        }
        //this.resize.bind(this);
        // Flow:
        // 1. Constructor
        // 2. componentWillMount()
        // 3. render()
        // 4. componentDidMount()
        // If props update:
        // 4.1 componentWillReceiveProps(nextProps : IProps), then goto 5.
        // If States update
        // 5. shouldComponentUpdate() if return false, then no rerendering.
        // 6. if True, then componentWillUpdate
        // 7. render()
        // 8. componentDidUpdate
        // If Unmount, then componentWillUnmount()
    }
    // Component Configurable Methods.
    componentDidMount(){
    }
    // Mount
    componentWillMount() {
        //console.log('Component will mount!')
     }

     
    // Update
     shouldComponentUpdate(nextProps:IProps, nextState:IState){
        return true;
    }
     componentWillUpdate(nextProps:IProps, nextState:IState) {
        //console.log('Component will update!');
     }

     componentDidUpdate(prevProps:IProps, prevState:IState) {

        
     }
     
    
    public getSimilarityFeatureSet(node_list:any, anchor_list:any, feature_list:any, feature_value_list:any, label_list:any, k:number=5){
        
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

    public getShortestPathDistanceSet(node_list:any, node_num:number,  neighbor_set:any, anchor_list:any){
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
   



    public constructPSJson(graph_object:any, show_mode:number, explained_node:number, onExplainNodeChange:any, onShowModeChange:any, CheckedList:any, width:number, height:number){
        //console.log("constructPSJson begin");
        console.log("constructPSJson", graph_object);
        let CheckedList_str = CheckedList.join("_");
        let common = graph_object;
        let individual = graph_object;
        let graph_name; 
        let graph_out;
        let layout_mode = getLayoutMode();
        if(layout_mode === 3){
            common = graph_object.common;
            individual = graph_object.individual;
            graph_name = common.name+"_"+common.dataset_id+"_"+(show_mode)+"_"+common.data_type_id+"_CheckedList_"+CheckedList_str+"_CheckedList_End_"+width+"_"+height;
            graph_out = individual.GCN.graph_out;
        }else{
            graph_name = graph_object.name+"_"+graph_object.dataset_id+"_"+(graph_object.model)
            +"_"+graph_object.explain_id 
            +"_"+(graph_object.graph)+"_"+graph_object.data_type_id+"_CheckedList_"+CheckedList_str+"_CheckedList_End_";
            graph_out = graph_object.graph_out;
        }

        //console.log(graph_object);
        let graph_in = common.graph_in;
        let graph_target = common.graph_target;
        let graph_explaination = common.graph_explaination;
        let explaination_type = graph_explaination.type;
        //let satisfied_rule_id = graph_object.rules_data.satisfied_rule_id;
        //console.log("rule_name" , graph_object.rules_data.rule_name)

        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        let data_type = common.data_type_id;
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
        let NeighborSet = constructNeighborSet(graph_in);
        //console.log("constructPSJson construct NeighborSet");
        let mask = common.mask;
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
        let train_mask_set = new Set(common.mask.train);
        function getNodeColorInfo(index:number){
            let ground_truth_label = graph_target.node_features[index];
            //let label = ground_truth_label;
            let GCN_prediction_label = individual.GCN.graph_out.node_features[index];   //
            let MLP_prediction_label = individual.MLP.graph_out.node_features[index]; 
            let GCN_Identity_features_prediction_label = individual.GCN_Identity_features.graph_out.node_features[index]; 
            // Ground Truth Color / Prediction Color
            let color:any = [getCoraNodeColor(ground_truth_label, 2), 
                getCoraNodeColor(GCN_prediction_label,3),
                getCoraNodeColor(MLP_prediction_label,3),
                getCoraNodeColor(GCN_Identity_features_prediction_label,3),
                getTrainColor(index, train_mask_set)
            ];    //
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
        if(data_type === 2){
            let node_num = graph_target.node_features.length;
            let num_classes = common.graph_additional_info.num_class;
            let selected_mask = constructSelectedMask(node_num, CheckedList, mask);
            //console.log("Mask",this.state.checkedList, selected_mask);
            // TODO:
            let meta_package:any = constructMetaInformation(node_num,NeighborSet,graph_target.node_features, graph_out.node_features)
            //console.log("shortest_path_distance, selected_mask, node_num, NeighborSet, mask.train", selected_mask, node_num, NeighborSet, mask.train);
            let enableSPD = true;
            let enableKFS = true;
            let shortest_path_distance_package:any, feature_similarity_list:any;
            if(enableSPD){
                shortest_path_distance_package = common.graph_additional_info.SPD;
            }else{
                shortest_path_distance_package = this.getShortestPathDistanceSet(selected_mask, node_num, NeighborSet, mask.train);
            }
            if(enableKFS){
                feature_similarity_list = common.graph_additional_info.KFS;
            }else{
                feature_similarity_list = this.getSimilarityFeatureSet(selected_mask, mask.train, graph_in.feature, graph_in.feature_value, graph_target.node_features);
            }
           // console.log("shortest_path_distance_package", shortest_path_distance_package);
           // console.log("feature similarity list", feature_similarity_list);
            //console.log("shortest_path_distance_package", shortest_path_distance_package);
            let degree_list = meta_package["degree_list"];
            let degree_range_list = constructDegreeRangeList(degree_list.slice());
            //console.log("degree_range_list length bucket", degree_range_list, degree_range_list.length, 8);
            //let max_degree = Math.max(...degree_list);
            let one_hop_accuracy_list = meta_package["one_hop_accuracy_list"];
            let cn_consistency_list = meta_package["cn_consistency_list"];
            //console.log("cn_consistency_list", cn_consistency_list);
            //let PCPData = [];
            //let PCPIndex = [];
            let PSData:any = [];
            //let ground_truth_label_range = constructRange(graph_target.node_features);
            //let prediction_label_range = constructRange(graph_out.node_features);  //TODO
            //let PSColumns = ["Ground_Truth_Label", "GCN_Prediction_Label","GCN_correctness","GCN_one_hop_accuracy","GCN(w/o_adj)_Prediction_Label", 
            //"GCN(w/o_features)_Prediction_Label","Degree"];
            let P1_name = individual.GCN.real_model_name;
            let P2_name = individual.MLP.real_model_name;
            let P3_name = individual.GCN_Identity_features.real_model_name;
            let pie_name = [P1_name, P2_name, P3_name];
            let P1_correctness = P1_name+"_correctness";
            let P2_correctness = P2_name+"_correctness";
            let P3_correctness = P3_name+"_correctness";
            let P1_one_hop_accuracy = P1_name+"_one_hop_accuracy";
            let CGTNGT_name = "Label_consistency";
            let CGTNPT_name = "Label-Prediction_consistency";
            let CPTNGT_name = "Prediction-Label_consistency";
            let CPTNPT_name = "Prediction_consistency";
            let SPD_consistency_name = "Nearest_training_nodes_dominant_label_consistency";
            let KFS_consistency_name = "Top-k_most_similar_training_nodes_dominant_label_consistency";
            let SPD_distribution_name = "Nearest_training_nodes_label_distribution";
            let KFS_distribution_name = "Top-k_most_similar_training_nodes_label_distribution"
            let Distance_name = "Shortest_Path_Distance_to_Training_Nodes";
            //let Default_PSColumns = ["Rule",P1_correctness,"Label"];
            //let Default_PSColumns = [P1_correctness,"Confidence",
            //CGTNGT_name,SPD_consistency_name,KFS_consistency_name, "Label"]
            let Default_PSColumns = [P1_correctness,SPD_consistency_name,KFS_consistency_name, "Label"]
            /**
             * 
             */
            /*let PSColumns = ["Label",P1_correctness,P1_one_hop_accuracy,P2_correctness, 
            P3_correctness,"Degree","Shortest_Path_Distance_to_Train_Nodes","Rule",
            "CGTNGT","CGTNPT","CPTNGT","CPTNPT","SPD_label","KFS_label",
            "SPD_consistency","KFS_consistency","Confidence"];*/
            let PSColumns = ["Label",P1_correctness,P1_one_hop_accuracy,P2_correctness, 
            P3_correctness,"Degree",Distance_name,
            CGTNGT_name,CGTNPT_name,CPTNGT_name,CPTNPT_name,
            SPD_consistency_name,KFS_consistency_name,"Confidence"];
            for(let i = 0; i<num_classes;i++){
                PSColumns.push(SPD_distribution_name+"_"+i);
            }
            for(let i = 0; i<num_classes;i++){
                PSColumns.push(KFS_distribution_name+"_"+i);
            }
            
            /*let PCPDimension = [
                {name: 'degree', range: [1,max_degree], type:"log"},
                {name: 'ground_truth_label', range: ground_truth_label_range, type:"ordinal"},
                {name: 'prediction_label', range: prediction_label_range, type:"ordinal"},
                {name: 'correctness', range: [0,1], type:"ordinal"},
                {name: 'one_hop_accuracy', range:[0,1], type:"continuous"}

            ];*/
            let whole_correct_num = 0;
            let whole_accuracy = 0;
            let ground_truth_label_stats:any = {};
            let correct_label = "Correct";
            let wrong_label = "Wrong";
            let shortest_path_label_consistency = 0, shortest_path_label_accuracy = 0;
            //console.log("constructPSJson prepare data");
            
            let getLabelName = () =>{
                let graph_info = common.graph_additional_info;
                let num_class = graph_info.num_class;
                let label = [];
                if(Object.keys(graph_info).indexOf("idx_to_class")>=0){
                    let idx_to_class = graph_info.idx_to_class;
                    for(let i = 0; i< num_class;i++){
                        label.push(idx_to_class[i])
                    }
                }else{
                    for(let i = 0; i< num_class;i++){
                        label.push(""+i);
                    }
                }
                return label;
            }
            let label_name = getLabelName();
            for(let i = 0; i<selected_mask.length;i++){
                let index = selected_mask[i];
                let node_json:any = {};
                let ground_truth_label = graph_target.node_features[index];
                let gcn_prediction_label = graph_out.node_features[index];
                let gcn_confidence = graph_out.output_vector[index][gcn_prediction_label];
                let mlp_prediction_label = individual.MLP.graph_out.node_features[index];
                let gcn_identity_features_prediction_label = individual.GCN_Identity_features.graph_out.node_features[index];
                node_json["Data_id"] = index;
                node_json["Color"] = getNodeColorInfo(index);
                //node_json["Rule"] = ""+satisfied_rule_id[index];
                if(enableSPD){
                    node_json["Shortest_Path_Distance_to_Train_Nodes"] = shortest_path_distance_package[index].dis;
                    node_json["Spd_node_info"] = shortest_path_distance_package[index].train_nodes;
                    
                }else{
                    node_json["Shortest_Path_Distance_to_Train_Nodes"] = shortest_path_distance_package[""+index].shortest_path_distance;
                    node_json["Spd_node_info"] = getLabelDistribution(shortest_path_distance_package[""+index].shortest_path_set, graph_target.node_features, num_classes);
                }
                if(node_json["Shortest_Path_Distance_to_Train_Nodes"] === "inf"){
                    node_json["Transformed_Distance"] = 0;
                }else{
                    /*
                    if(node_json["Shortest_Path_Distance_to_Train_Nodes"]===0){
                        node_json["Transformed_Distance"] = 1;
                    }else if(node_json["Shortest_Path_Distance_to_Train_Nodes"]===1){
                        node_json["Transformed_Distance"] = 0.75;
                    }else if(node_json["Shortest_Path_Distance_to_Train_Nodes"]===2){
                        node_json["Transformed_Distance"] = 0.50;
                    }else{
                        node_json["Transformed_Distance"] = 1/(1+node_json["Shortest_Path_Distance_to_Train_Nodes"]);
                    }*/
                    if(node_json["Shortest_Path_Distance_to_Train_Nodes"]>=5){
                        node_json["Transformed_Distance"] = 0;
                    }else{
                        node_json["Transformed_Distance"] = 1-0.2*node_json["Shortest_Path_Distance_to_Train_Nodes"];
                    }

                }
                node_json[Distance_name] = node_json["Shortest_Path_Distance_to_Train_Nodes"];
                shortest_path_label_consistency = shortest_path_label_consistency + node_json["Spd_node_info"][gcn_prediction_label];
                if(node_json["Spd_node_info"][gcn_prediction_label]>=Math.max(...node_json["Spd_node_info"])){
                    shortest_path_label_accuracy = shortest_path_label_accuracy + 1;
                }
                
                if(enableKFS){
                    node_json["Topkfs_node_info"] = feature_similarity_list[index]["train_nodes"];
                    node_json["Topkfs_nodes"] = feature_similarity_list[index]["details"];
                    node_json["Topkfs_nodes"] = node_json["Topkfs_nodes"].sort((a:any,b:any)=>{
                        if(a.anchor_label<b.anchor_label){
                            return -1;
                        }else if(a.anchor_label > b.anchor_label){
                            return 1;
                        }else{
                            if(a.anchor_similarity>b.anchor_similarity){
                                return -1;
                            }else{
                                return 1;
                            }
                        }
                    })
                }else{
                    let topk_feature_sim_set = feature_similarity_list[""+index].topk_anchor_similarity_list.map((d:any)=>d.anchor_id);
                    node_json["Topkfs_node_info"] = getLabelDistribution(topk_feature_sim_set, graph_target.node_features, num_classes);
                    
                    node_json["Topkfs_nodes"] = feature_similarity_list[""+index].topk_anchor_similarity_list;
                    node_json["Topkfs_nodes"] = node_json["Topkfs_nodes"].sort((a:any,b:any)=>{
                        if(a.anchor_label<b.anchor_label){
                            return -1;
                        }else if(a.anchor_label > b.anchor_label){
                            return 1;
                        }else{
                            if(a.anchor_similarity>b.anchor_similarity){
                                return -1;
                            }else{
                                return 1;
                            }
                        }
                    })
                }
                //node_json["Max_feature_similarity"] = feature_similarity_list[""+index].feature_similarity;
                //node_json["Mfs_node_info"] = getLabelDistribution(feature_similarity_list[""+index].feature_sim_set, graph_target.node_features, num_classes);

                
                
                
                
                node_json["CN_consistency"] = cn_consistency_list[index];
                node_json["Degree"] = getDegreeCategory(degree_list[index], degree_range_list);//""+degree_list[index];
                node_json["Real_Degree"] = degree_list[index];
                //if(degree_list[index] > 7){
                //    node_json["Degree"] = ">7";
               // }
                //node_json["Ground_Truth"] =  label_name[ground_truth_label];
                node_json["Ground_Truth_Label"] = ""+ground_truth_label;
                if(!(ground_truth_label in ground_truth_label_stats)){
                    ground_truth_label_stats[ground_truth_label] = {
                        "correct_num": 0,
                        "wrong_num" : 0
                    }
                }
                node_json["Label"] = node_json["Ground_Truth_Label"];
                // TODO:

                node_json["GCN_Prediction_Label"] =  ""+gcn_prediction_label;
                node_json["GCN_Confidence"] = gcn_confidence;
                node_json["GCN(w/o_adj)_Prediction_Label"] = ""+mlp_prediction_label;
                node_json["GCN(w/o_features)_Prediction_Label"] = ""+gcn_identity_features_prediction_label;
                node_json[P2_correctness] = mlp_prediction_label === ground_truth_label?correct_label:wrong_label;
                node_json[P3_correctness] = gcn_identity_features_prediction_label === ground_truth_label?correct_label:wrong_label;
                if(ground_truth_label===gcn_prediction_label){
                    node_json[P1_correctness] = correct_label;
                    whole_correct_num = whole_correct_num + 1;
                    ground_truth_label_stats[ground_truth_label]["correct_num"] = 
                    ground_truth_label_stats[ground_truth_label]["correct_num"] + 1;

                }else{
                    node_json[P1_correctness] = wrong_label;
                    ground_truth_label_stats[ground_truth_label]["wrong_num"] = 
                    ground_truth_label_stats[ground_truth_label]["wrong_num"] + 1;
                }
                node_json[P1_one_hop_accuracy] = ""+one_hop_accuracy_list[index];
                let one_hop_accuracy = one_hop_accuracy_list[index];
                if(one_hop_accuracy>0&&one_hop_accuracy<1){
                    node_json[P1_one_hop_accuracy] = "(0,1)";
                }
                /*if(one_hop_accuracy>0&&one_hop_accuracy<=0.2){
                    node_json["One_hop_accuracy"] = "(0,0.2]";
                }else if(one_hop_accuracy>0.2 && one_hop_accuracy <=0.4){
                    node_json["One_hop_accuracy"] = "(0.2,0.4]";
                }else if(one_hop_accuracy>0.4 && one_hop_accuracy <=0.6){
                    node_json["One_hop_accuracy"] = "(0.4,0.6]";
                }else if(one_hop_accuracy>0.6 && one_hop_accuracy <=0.8){
                    node_json["One_hop_accuracy"] = "(0.6,0.8)";
                }else if(one_hop_accuracy>0.8 && one_hop_accuracy <1){
                    node_json["One_hop_accuracy"] = "(0.8,1)";
                }*/
                //node_json["two_hop_accuracy"] = 
                PSData.push(node_json);
                //PCPIndex.push(index);
            }




            // binning CN, SPD, KFS
            let CN_list:any = [[],[],[],[]];
            let SPD_list:any = [];
            let KFS_list:any = [];
            let GCN_Confidence_list:any = [];
            let CN_range_list:any = [[],[],[],[]];
            let SPD_range_list:any = [];
            let KFS_range_list:any = [];
            let GCN_Confidence_range_list:any = [];
            for(let i = 0; i<num_classes;i++){
                SPD_list.push([]);
                KFS_list.push([]);
                SPD_range_list.push([]);
                KFS_range_list.push([]);
            }

            //let degree_list = meta_package["degree_list"];
            //let degree_range_list = constructDegreeRangeList(degree_list.slice());
            for(let i = 0; i<PSData.length;i++){
                let node_json = PSData[i];
                let cn_consistency = node_json["CN_consistency"];
                CN_list[0].push(cn_consistency["cgt_ngt"]);
                CN_list[1].push(cn_consistency["cgt_npt"]);
                CN_list[2].push(cn_consistency["cpt_ngt"]);
                CN_list[3].push(cn_consistency["cpt_npt"]);
                let spd = node_json["Spd_node_info"];
                let kfs = node_json["Topkfs_node_info"];
                for(let j = 0 ;j<num_classes;j++){
                    SPD_list[j].push(spd[j]);
                    KFS_list[j].push(kfs[j]);
                }
                GCN_Confidence_list.push(node_json["GCN_Confidence"]);
            }

            for(let i = 0; i<CN_list.length; i++){
                CN_range_list[i] = binningContinuousVariable(CN_list[i]);
            }
            for(let i = 0; i<SPD_list.length; i++){
                SPD_range_list[i] = binningContinuousVariable(SPD_list[i]);
            }
            for(let i = 0; i<KFS_list.length; i++){
                KFS_range_list[i] = binningContinuousVariable(KFS_list[i]);
            }
            GCN_Confidence_range_list = binningContinuousVariable(GCN_Confidence_list);
            for(let i = 0; i<PSData.length;i++){
                let node_json = PSData[i];
                let cn_consistency = node_json["CN_consistency"];
                node_json[CGTNGT_name] = getContinuousVariableCategory(cn_consistency["cgt_ngt"],CN_range_list[0]);
                node_json[CGTNPT_name] = getContinuousVariableCategory(cn_consistency["cgt_npt"],CN_range_list[1]);
                node_json[CPTNGT_name] = getContinuousVariableCategory(cn_consistency["cpt_ngt"],CN_range_list[2]);
                node_json[CPTNPT_name] = getContinuousVariableCategory(cn_consistency["cpt_npt"],CN_range_list[3]);
                let spd = node_json["Spd_node_info"];
                let kfs = node_json["Topkfs_node_info"];

                for(let j = 0 ;j<num_classes;j++){
                    node_json[SPD_distribution_name+"_"+j]=getContinuousVariableCategory(spd[j],SPD_range_list[j]);
                    node_json[KFS_distribution_name+"_"+j]=getContinuousVariableCategory(kfs[j],KFS_range_list[j]);
                }
                let spd_label = getMaxComponent(spd);
                let kfs_label = getMaxComponent(kfs);
                if(spd_label === -1){
                    node_json["SPD_label"] = "Not Sure";
                    node_json[SPD_consistency_name] = "Not Sure";
                }else{
                    node_json["SPD_label"] = ""+spd_label;
                    if(node_json["Ground_Truth_Label"] === node_json["SPD_label"]){
                        node_json[SPD_consistency_name] = "True";
                    }else{
                        node_json[SPD_consistency_name] = "False";
                    }
                }
                if(kfs_label === -1){
                    node_json["KFS_label"] = "Not Sure";
                    node_json[KFS_consistency_name] = "Not Sure";
                }else{
                    node_json["KFS_label"] = ""+kfs_label;
                    if(node_json["Ground_Truth_Label"] === node_json["KFS_label"]){
                        node_json[KFS_consistency_name] = "True";
                    }else{
                        node_json[KFS_consistency_name] = "False";
                    }
                }
                node_json["Confidence"] = getContinuousVariableCategory(node_json["GCN_Confidence"], GCN_Confidence_range_list);

            }

















            //console.log("len, shortest_path_label_accuracy, rate", selected_mask.length, shortest_path_label_accuracy, shortest_path_label_accuracy / selected_mask.length );
            PSData["columns"] = PSColumns;
            PSData["default_columns"] = Default_PSColumns;
            let keys = Object.keys(ground_truth_label_stats);
            let maxtotal = 0;
            for(let i = 0 ;i < keys.length; i++){
                let key = keys[i];
                let stats = ground_truth_label_stats[key];
                let total = stats["correct_num"] + stats["wrong_num"];
                if(total > 0){
                    stats["accuracy"] = stats["correct_num"] / total;
                }else{
                    stats["accuracy"] = 0;
                }
                stats["total"] = total;
                if(total > maxtotal ){
                    maxtotal = total;
                }
            }   
            for(let i = 0 ;i<keys.length;i++){
                let key = keys[i];
                let stats = ground_truth_label_stats[key];
                if(maxtotal > 0){
                    stats["max_percentage"] = stats["total"] / maxtotal;
                }else{
                    stats["max_percentage"] = 0;
                }
            }

            if(selected_mask.length <= 0 ){
                console.log("No selected data.");
                return {"success": false};
            }else{
                whole_accuracy = whole_correct_num / selected_mask.length;
                let graph_json = {
                    "success":true,
                    "name":graph_name,
                    "PSData":PSData,
                    "accuracy":whole_accuracy,
                    "nodenum":selected_mask.length,
                    "pie_name":pie_name
                }
                return graph_json;
            }
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }
        
    }
    public showPSSettingModal(){
        this.props.changePSSettingsModal_visible(true);
    }
    public render() {
        //console.log("render PS view");
        let {graph_object, show_mode, explained_node, onExplainNodeChange, onShowModeChange} = this.props;
        //let screenwidth = window.innerWidth;
        //let screenheight = window.innerHeight;
        //let PCPJson:any = this.constructPCPJson(graph_object,show_mode, explained_node, onExplainNodeChange, onShowModeChange, this.state.checkedList);
        let layout_mode:any = getLayoutMode();
        if(layout_mode === 3){
            let PSWidth = this.props.width - 10;
            let PSHeight = this.props.height - 60;
            let PSJson:any = this.constructPSJson(graph_object,show_mode, explained_node, onExplainNodeChange, onShowModeChange, this.props.checkedList, PSWidth, PSHeight);
            //console.log("construct PS Json", PSJson);
            this.props.changePSJson(PSJson);
            let current_bundle_id = graph_object["bundle_id"];
            let prev_bundle_id = this.prev_bundle_id;
            if(current_bundle_id !== prev_bundle_id){
                this.props.changePSDimensions(PSJson["PSData"]["default_columns"]);
                this.prev_bundle_id = current_bundle_id;
            }
            
            return <div style={{width: "100%", height:""+(this.props.height - 10)+"px", overflowX: "hidden"}}>
                
                <div className="ViewTitle">Parallel Sets View
                <div style={{float:'right'}}>
                            {PSJson["success"]?(
                            <div>
                                <div>
                                    <Button type="default" size="small" onClick={()=>{this.showPSSettingModal()}} ><SettingOutlined /></Button>
                                    {/*<Button type="default" size="small" onClick={()=>{this.showPSSettingModal()}}>Settings</Button>*/}
                                    <PSSettingsModalContainer CandidatePSDimensions={PSJson["PSData"]["columns"]} DefaultPSDimensions={PSJson["PSData"]["default_columns"]}/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    {/*Accuracy: <Tag>{PCPJson["accuracy"].toFixed(4)}</Tag>  &nbsp;&nbsp;&nbsp;&nbsp; <Tag>{PSJson["nodenum"]}</Tag>*/} 
                                    #Nodes: <PSViewNodeStatisticContainer totalNodeNum={PSJson["nodenum"]}></PSViewNodeStatisticContainer>
                                </div>
                                
                            </div>)
                            :
                            (<div />)}
                            </div>
                </div>
                <div className="ViewBox">
                    <Row gutter={4}>
                        <Row>
                            {PSJson["success"]?(
                            <ParallelSetsContainer width={PSWidth} height={PSHeight} PSJson={PSJson} />):(<div />)}
                        </Row>
                        
                    </Row>
                   
                    
                </div>
                {/*<Row>
                    {PSJson["success"]?(<SelectedNodeListContainer PCPJson={PSJson} height={screenheight*0.29} width={screenwidth * 6/ 24 -20}/>):(<div />)}
                </Row>*/}
            </div>
        }else{
            return <div />
        }
    }
}

