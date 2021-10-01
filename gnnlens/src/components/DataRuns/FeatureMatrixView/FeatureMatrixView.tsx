
import * as React from "react";
import MatrixContainer from '../../../container/MatrixContainer';
import BrushBarChartContainer from '../../../container/BrushBarChartContainer';
import IndentedListContainer from '../../../container/IndentedListContainer';
import { Select, } from 'antd';
import {getCoraNodeColor, getLayoutMode, getTrainColor,cropAnchorsList} from '../../../helper';
import VerticalSliderContainer from "../../../container/VerticalSliderContainer";
const reorder_module = require("./reorder.v1.js");
const reorder = reorder_module.default;

const Option = Select.Option;


//console.log("reorder", reorder);
//console.log("tiny_queue, sciencce, reorder", tiny_queue, science, reorder.stablepermute);
/*var mat = [
    [1, 0, 1, 1, 0],
    [0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0],
    [0, 1, 0, 0, 1],
    ];
var leafOrder = reorder.optimal_leaf_order()
    .distance(science.stats.distance.manhattan);
var perm = leafOrder(mat);
var permuted_mat = reorder.stablepermute(mat, perm);
console.log("reorder, mat, perm, permuted_mat", reorder, mat, perm, permuted_mat);*/
//const d3 = require("d3");
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
    specificNodeIdList: any[],
    select_inspect_node:number,
    showSource : boolean,
    extendedMode: any,
    K_value:any,
    selected_models_list:any

}
export interface IState {
    axis_select : number,
    distance_select : number,
    dataSource_select: number,
    color_encode: number,
    enableSorting: boolean,
    node_start_index: number
}

export default class FeatureMatrixView extends React.Component<IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.onAxisChange = this.onAxisChange.bind(this);
        this.onDistanceChange = this.onDistanceChange.bind(this);
        this.onDataSourceChange = this.onDataSourceChange.bind(this);
        this.onColorEncodeChange = this.onColorEncodeChange.bind(this);
        this.onEnableSort = this.onEnableSort.bind(this);
        this.changeNodeStartIndex = this.changeNodeStartIndex.bind(this);
        this.state = {
            axis_select : 2,
            distance_select: 1,
            dataSource_select : 1,
            color_encode: 2,
            enableSorting: true,
            node_start_index: 0
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
     public calculateFeatureCosDistance(feature1:any, feature1_value:any, feature2:any, feature2_value:any){
        let len1 = feature1.length;
        let len2 = feature2.length;
        let dot = 0;
        for(let k = 0; k<len1; k++){
            let index2 = feature2.indexOf(feature1[k]);
            if(index2>=0){
                dot = dot + feature1_value[k]*feature2_value[index2];
            }
        }
        let norm1 = 0;
        let norm2 = 0;
        for(let k = 0; k<len1; k++){
            norm1 = norm1 + feature1_value[k]*feature1_value[k];
        }
        for(let k=0; k<len2; k++){
            norm2 = norm2 + feature2_value[k]*feature2_value[k];
        }
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);
        let cos_distance = dot / (norm1 * norm2 + 1e-8);
        return cos_distance;
    }
    public calculateFeatureDistance(feature1:any, feature2:any){
        let len1 = feature1.length;
        let len2 = feature2.length;
        let common = 0;
        for(let k = 0; k<len1; k++){
            if(feature2.indexOf(feature1[k])>=0){
                common = common + 1;
            }
        }
        return len1 + len2 - 2* common;
    }
    public calculateEuclideanDistance(feature1:any, feature2:any){
        let len1 = feature1.length;
        //let len2 = feature2.length;
        let dis = 0;
        for(let i = 0; i < len1; i++)
        {
            dis = dis + (feature1[i] - feature2[i]) * (feature1[i] - feature2[i]);
        }
        dis = Math.sqrt(dis);
        return dis;
    }
    public constructIndentedList(PathDict:any, select_node:number, level:number, max_level:number, additional_params:any){
        let getNodeColorInfo = additional_params["getNodeColorInfo"];
        let features = additional_params["features"];
        let features_value = additional_params["features_value"];
        let queue:any [] = [];
        let alreadyVisitedNodesId:any[] = [];
        let alreadyVisitedNodesInfo:any[] = [];
        queue.push({
            "id":select_node,
            "color":getNodeColorInfo(select_node),
            "level":level,
            "dist":2
        });
        let feature1 = features[select_node];
        let feature1_value = features_value[select_node];
        while(queue.length>0){
            let current_node:any = queue[0];
            let current_node_id:number = current_node.id;
            let current_node_level:number = current_node.level;
            queue.shift();
            if(alreadyVisitedNodesId.indexOf(current_node_id)>=0){
                continue;
            }
            if(current_node_level>max_level){
                continue;
            }

            alreadyVisitedNodesInfo.push(current_node);
            alreadyVisitedNodesId.push(current_node_id);
            let succnodes = Object.keys(PathDict[current_node_id]);
            if(current_node_level+1<=max_level){
                let succ_level = current_node_level + 1;
                for(let i = 0; i<succnodes.length; i++){
                    let succ_id = parseInt(succnodes[i]);
                    if(alreadyVisitedNodesId.indexOf(succ_id)>=0){
                        continue;
                    }
                    let feature2 = features[succ_id];
                    let feature2_value = features_value[succ_id];
                    let cos_distance = this.calculateFeatureCosDistance(feature1, feature1_value, feature2, feature2_value);
                    queue.push({
                        "id":succ_id,
                        "color":getNodeColorInfo(succ_id),
                        "level":succ_level,
                        "dist": cos_distance
                    })
                }
            }
        }
        
        alreadyVisitedNodesInfo.sort((a:any,b:any)=>{
            return a.dist>b.dist?-1:1;
        })
        return alreadyVisitedNodesInfo;
    }
    public constructIndentedListFromKFS(select_node:number, KFS:any, additional_params:any){
        let getNodeColorInfo = additional_params["getNodeColorInfo"];
        let alreadyVisitedNodesInfo:any[] = [];
        alreadyVisitedNodesInfo.push({
            "id":select_node,
            "color":getNodeColorInfo(select_node),
            "level":0,
            "dist":2
        });
        let cropAnchors = cropAnchorsList(KFS[select_node]["details"], this.props.K_value);
        let feature_sim_set = cropAnchors.forEach((d:any)=>{
            let anchor_id = d.anchor_id;
            alreadyVisitedNodesInfo.push({
                "id":anchor_id,
                "color":getNodeColorInfo(anchor_id),
                "level":1,
                "dist":d.anchor_similarity
            });
        });
        //console.log("feature_sim_set",feature_sim_set);
        alreadyVisitedNodesInfo.sort((a:any,b:any)=>{
            return a.dist>b.dist?-1:1;
        })
        return alreadyVisitedNodesInfo;
    }
    public constructIndentedTree(PathDict:any, select_node:number, level:number, 
        max_level:number, row_id:number, root:number, additional_params:any, edge_weight:number=0){
        let getNodeColorInfo = additional_params["getNodeColorInfo"];
        let features = additional_params["features"];
        let features_value = additional_params["features_value"];
        if(level >= max_level){
            return {
                "name":""+select_node,
                "children":[],
                "row_id":row_id,
                "next_row_id":row_id+1,
                "edge_weight":edge_weight,
                "color":getNodeColorInfo(select_node)
            }
        }else{
            let succnodes = Object.keys(PathDict[select_node]);
            let children:any = [];
            let curr_row_id = row_id;
            let next_row_id:number = row_id+1;
            let succnode_id_list:any = [];
            let feature1 = features[root];
            let feature1_value = features_value[root];
            for(let k = 0; k< succnodes.length; k++ ){
                let succnode = parseInt(succnodes[k]);
                if(succnode === select_node || succnode === root){
                    continue;
                }
                let feature2 = features[succnode];
                let feature2_value = features_value[succnode];
                let cos_distance = this.calculateFeatureCosDistance(feature1, feature1_value, feature2, feature2_value);
                succnode_id_list.push(
                    {
                        "id":succnode,
                        "dist":cos_distance
                    }
                );
            }
            succnode_id_list.sort((a:any,b:any)=>{
                return a.dist>b.dist?-1:1;
            })
            for(let k = 0; k<succnode_id_list.length; k++){
                let succnode = succnode_id_list[k].id;
                let local_edge_weight = PathDict[select_node][succnode];
                let children_package:any = this.constructIndentedTree(PathDict, succnode, level+1, max_level, next_row_id, root, additional_params, local_edge_weight);
                next_row_id = children_package.next_row_id;
                children.push(children_package);
            }
            return {
                "name":""+select_node,
                "children":children,
                "row_id":curr_row_id,
                "next_row_id":next_row_id,
                "edge_weight":edge_weight,
                "color":getNodeColorInfo(select_node)
            }
        }
    }
    public sequentialIndentedTree(indentedTreeNode:any){
        let selectedIndetendedTreeId:any[] = [];
        selectedIndetendedTreeId.push(parseInt(indentedTreeNode["name"]));
        for(let i = 0; i<indentedTreeNode.children.length; i++){
            selectedIndetendedTreeId = selectedIndetendedTreeId.concat(this.sequentialIndentedTree(indentedTreeNode.children[i]));
        }
        return selectedIndetendedTreeId;
    }
    public sequentialIndentedTreeToList(indentedTreeNode:any, depth:number=0){
        let selectedIndetendedTreeId:any[] = [];
        let data_package = {
            "id": parseInt(indentedTreeNode["name"]),
            "name" : indentedTreeNode["name"],
            "color": indentedTreeNode["color"],
            "depth": depth
        }
        selectedIndetendedTreeId.push(data_package);
        for(let i = 0; i<indentedTreeNode.children.length; i++){
            selectedIndetendedTreeId = selectedIndetendedTreeId.concat(this.sequentialIndentedTreeToList(indentedTreeNode.children[i], depth + 1));
        }
        return selectedIndetendedTreeId;
    }
    public getNodeColorInfoFull(index:number, graph_target:any, individual:any, train_mask_set:any, selected_models_list:any){
        let ground_truth_label = graph_target.node_features[index];
        let color:any = [getCoraNodeColor(ground_truth_label, 2)];
        for(let i = 0; i<selected_models_list.length; i++){
            color.push(getCoraNodeColor(individual[selected_models_list[i]].graph_out.node_features[index]));
        }
        color.push(getTrainColor(index, train_mask_set));
        return color;
    }
    public hclusterSortingSelectedNode(params:any){
        let num_nodes = params["num_nodes"];
        let selectedNodeIdList = params["selectedNodeIdList"];
        let features = params["features"];
        let features_value = params["features_value"];

        let distanceMatrix:any = [];
        let mat:any = [];
        let highlight_flag:any = [];

        // Step 1: Initialize variables

        for(let i = 0; i <num_nodes ; i++){
            let row_dist = [];
            for(let j = 0 ;j<num_nodes; j++){
                row_dist.push(0);
            }  
            distanceMatrix.push(row_dist);
            mat.push([selectedNodeIdList[i],0]);
            highlight_flag.push(false);
        }

        // Step 2: construct distance matrix

        for(let i = 0; i<num_nodes; i++){
            let node1 = selectedNodeIdList[i];
            let feature1 = features[node1];
            let feature1_value = features_value[node1];
            for(let j = 0; j<i; j++){
                let node2 = selectedNodeIdList[j];
                let feature2 = features[node2];
                let feature2_value = features_value[node2];
                let cos_distance = this.calculateFeatureCosDistance(feature1, feature1_value, feature2, feature2_value);
                let distance = 1 - cos_distance;
                distanceMatrix[i][j] = distance;
                distanceMatrix[j][i] = distance;
            }
        }

        // Step 3: Reordering

        var leafOrder = reorder.optimal_leaf_order()
            .distance_matrix(distanceMatrix);
        var perm = leafOrder(mat);
        var permuted_mat = reorder.stablepermute(mat, perm);
        var new_selectedNodeIdList = [];
        for(let i = 0; i<num_nodes;i++){
            new_selectedNodeIdList.push(permuted_mat[i][0]);
        }
        selectedNodeIdList = new_selectedNodeIdList.slice();
        
        // Step 4: Highlight similar distance nodes.

        let distance_list:any = [];
        for(let i = 1; i<num_nodes; i++){
            let node1 = selectedNodeIdList[i];
            let feature1 = features[node1];
            let feature1_value = features_value[node1];
            let j = i-1;
            
            let node2 = selectedNodeIdList[j];
            let feature2 = features[node2];
            let feature2_value = features_value[node2];
            let cos_distance = this.calculateFeatureCosDistance(feature1, feature1_value, feature2, feature2_value);
            let distance = 1 - cos_distance;
            distance_list.push(distance);
            if(distance<0.2){
                highlight_flag[i] = true;
                highlight_flag[j] = true;
            }
            
        }
        return {
            "selectedNodeIdList":selectedNodeIdList,
            "highlight_flag":highlight_flag
        }
    }
    public hclusterSortingSelectedFeatures(params:any){
        let pre_selected_feature_stats_index:any = params["pre_selected_feature_stats_index"];
        let pre_selected_feature: any = params["pre_selected_feature"];
        let featureDistanceMatrix = [];
        let num_features = pre_selected_feature_stats_index.length;
        let feature_mat = [];
        for(let i = 0; i <num_features ; i++){
            let row_dist = [];
            for(let j = 0 ;j<num_features; j++){
                row_dist.push(0);
            }  
            featureDistanceMatrix.push(row_dist);
            feature_mat.push([pre_selected_feature[i],0]);
        }
        for(let i = 0; i<num_features; i++){
            //let node1 = pre_selected_feature[i];
            let feature1 = pre_selected_feature_stats_index[i];
            for(let j = 0; j<i; j++){
                //let node2 = pre_selected_feature[j];
                let feature2 = pre_selected_feature_stats_index[j];
                //let cos_distance = calculateFeatureCosDistance(feature1, feature1_value, feature2, feature2_value);
                //let distance = 1 - cos_distance;
                //let distance = calculateEuclideanDistance(feature1, feature2);
                let distance = this.calculateFeatureDistance(feature1, feature2);
                featureDistanceMatrix[i][j] = distance;
                featureDistanceMatrix[j][i] = distance;
            }
        }
        var leafOrder = reorder.optimal_leaf_order()
            .distance_matrix(featureDistanceMatrix);
        var perm = leafOrder(feature_mat);
        
        //var permuted_mat = reorder.stablepermute(feature_mat, perm);
        //console.log("perm, mat, permuted_mat", perm, mat, permuted_mat);
        
        return {
            "perm":perm,

        }
    }
     public constructFeatureMatrixJson(graph_object:any, selectedNodeIdList:any[], axis_select:number, 
        distance_select:number, dataSource_select:number, color_encode:number, select_inspect_node:number, 
        showSource:boolean, enableSorting:boolean, width:number, height:number, extendedMode:any, additional_params:any, selected_models_list:any){
        let max_col_num_block = additional_params["max_col_num_block"];
        let node_start_index = additional_params["node_start_index"];
        
        // axis_select : 2, Y Axis
        // distance_select: 1, Detailed Feature
        // dataSource_select : 1, Input Layer
        // color_encode: 2, Ground Truth
        /**
         * let dataSourceOptions = [
                [1, "Input Layer"],
                [2, "Hidden Layer"],
                [3, "Output Layer"]
            ];
            let distanceOptions = [
                [1, "Detailed Feature"],
                [2, "Distance"]
            ];

            let axisOptions = [
                [1, "X Axis"],
                [2, "Y Axis"]
            ];
            let colorOptions = [
                [2, "Ground Truth"],
                [3, "Model Output"],
                [5, "True / False"]
            ]
         */
        let selectedStr = selectedNodeIdList.join("_");
        let selectedModelStr = selected_models_list.join("_");
        let common = graph_object.common;
        let individual = graph_object.individual;
        let graph_name = common.name+"_"+common.dataset_id+"_"+common.data_type_id+"_SELECTED_"+selectedStr+"_SELECTED_END_"
        +axis_select+"_"+distance_select+"_"+dataSource_select+"_"+color_encode+"_"+select_inspect_node+"_"+enableSorting+"_"+width+"_"+height+"_"+this.props.K_value
        +"_SELECTEDMODEL_"+selectedModelStr + "_SELECTEDMODELEND_";
        if(showSource){
            graph_name = graph_name+"_"+extendedMode;
        }else{
            graph_name = graph_name+"_"+node_start_index+"_"+max_col_num_block;
        }
    

        let graph_in = common.graph_in;
        let graph_target = common.graph_target;
        let key_model_name = selected_models_list[0];

        //let graph_out = individual.GCN.graph_out; // 
        let graph_explaination = common.graph_explaination;
        let explaination_type = graph_explaination.type;
        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        if(selectedNodeIdList.length === 0){
            return {"success":false};

        }
        //let message_passing: any = individual.GCN.message_passing;
        //let PathDict = constructPathDict(message_passing);
        let train_mask_set = new Set(common.mask.train);
        let features : any;
        let features_value:any = [];
        if(dataSource_select === 1){
            features = graph_in.feature;
            features_value = graph_in.feature_value;
        }
        let getNodeColorInfoFull = this.getNodeColorInfoFull;
        function getNodeColorInfo(index:number){
            return getNodeColorInfoFull(index, graph_target,individual, train_mask_set, selected_models_list);
        }
        
        // Construct Indented Tree.
        //let indentedTree:any = {}
        let indentedList:any = [];
        let selectedIndetendedListId:any = [];
        //let selectedIndetendedTreeId:any[] = [];
        //let selectedIndetendedTreeNodeInfo:any[] = [];
        
        if(showSource){
            let additional_params = {
                "getNodeColorInfo":getNodeColorInfo,
                "features":features,
                "features_value": features_value
            }
            indentedList = this.constructIndentedListFromKFS(select_inspect_node, common.graph_additional_info.KFS, additional_params);
            selectedIndetendedListId = indentedList.map((d:any)=>{
                return d.id;
            })
            selectedNodeIdList = selectedIndetendedListId;
            console.log("Feature Matrix Common", common.graph_additional_info.KFS, indentedList);
        }

        let matrix:any[] = [];
        let selectedFeature:any[] = [];
        let selectedFeatureStatistics:any[] = [];

        let upper_bound_nodes = 300;
        let highlight_flag:any = [];
        let node_max_index = 0;
        function getArray(num:number){
            let arr : any[] = [];
            for(let i = 0; i<num; i++){
                arr.push(0);
            }
            return arr;
        }
        let num_classes = common.graph_additional_info.num_class;
        if(selectedNodeIdList.length > 0 && selectedNodeIdList.length <= upper_bound_nodes){
            if(dataSource_select === 1){
                // Input Layer Embedding

                // Step 1: Node reordering.
                let num_nodes = selectedNodeIdList.length;
                let total_nodes = selectedNodeIdList.length;
                node_max_index = total_nodes - max_col_num_block;
                if(node_max_index<0){
                    node_max_index = 0;
                }
                if(num_nodes>=2 && !showSource){
                    let params = {
                        "num_nodes":num_nodes,
                        "selectedNodeIdList":selectedNodeIdList,
                        "features":features,
                        "features_value":features_value
                    }
                    // Distance = 1 - cos(<f1, f2>);
                    let result_package = this.hclusterSortingSelectedNode(params);
                    highlight_flag = result_package["highlight_flag"];
                    selectedNodeIdList = result_package["selectedNodeIdList"];
                    let node_end_index = 0;
                    num_nodes = selectedNodeIdList.length;
                    if(node_start_index>=num_nodes){
                        console.log("node_start_index, num_nodes", node_start_index, num_nodes);
                        node_start_index = 0;
                        if(num_nodes >= max_col_num_block){
                            node_end_index = max_col_num_block;
                        }else{
                            node_end_index = num_nodes;
                        }
                    }else if(node_start_index<num_nodes){
                        if(num_nodes >= node_start_index+max_col_num_block){
                            node_end_index = node_start_index+max_col_num_block;
                        }else{
                            node_end_index = num_nodes;
                        }
                    }
                    selectedNodeIdList = selectedNodeIdList.slice(node_start_index, node_end_index);
                    highlight_flag = highlight_flag.slice(node_start_index, node_end_index);
                    num_nodes = selectedNodeIdList.length;
                    
                }
                
                // Step 2: Pre select feature dimensions.

                let pre_selected_feature:any[] = [];
                let pre_selected_feature_stats:any[] = [];
                let pre_selected_feature_order:any[] = [];
                let pre_selected_feature_order_list:any[] = [];
                let pre_selected_feature_stats_index:any[] = [];
                let pre_selected_feature_prediction_label_distribution:any[] = [];
                for(let i = 0; i <selectedNodeIdList.length ; i++){
                    let currentSelect:any = selectedNodeIdList[i];
                    let GCN_prediction_label = individual[key_model_name].graph_out.node_features[currentSelect]; 

                    //y_axis.push(currentSelect);
                    for(let j = 0;j <features[currentSelect].length;j ++){
                        let dimension = features[currentSelect][j];
                        if(pre_selected_feature.indexOf(dimension) >= 0){
    
                        }else{
                            pre_selected_feature.push(dimension);
                            pre_selected_feature_stats.push(0);
                            pre_selected_feature_order.push(i);
                            pre_selected_feature_stats_index.push([]);
                            pre_selected_feature_order_list.push([]);
                            pre_selected_feature_prediction_label_distribution.push({
                                "distribution":getArray(num_classes)
                            })
                        }
                        let feature_index = pre_selected_feature.indexOf(dimension);
                        pre_selected_feature_stats[feature_index] = pre_selected_feature_stats[feature_index] + 1;
                        pre_selected_feature_stats_index[feature_index].push(currentSelect);
                        pre_selected_feature_order_list[feature_index].push(i);
                        pre_selected_feature_prediction_label_distribution[feature_index]["distribution"][GCN_prediction_label] = 
                        pre_selected_feature_prediction_label_distribution[feature_index]["distribution"][GCN_prediction_label] + 1;
                    }
                }
                for(let i = 0; i<pre_selected_feature_prediction_label_distribution.length; i++){
                    let distribution = pre_selected_feature_prediction_label_distribution[i]["distribution"];
                    let total_num = 0;
                    for(let j = 0; j <distribution.length; j++){
                        total_num = total_num + distribution[j];
                    }
                    if(total_num >0){
                        for(let j = 0; j <distribution.length; j++){
                            distribution[j] = distribution[j] / total_num;
                         }
                    }
                    pre_selected_feature_prediction_label_distribution[i]["distribution"] = distribution;
                }
                // Step 3: Feature dimension reordering.
                //console.log("before features", pre_selected_feature);
                /*if(pre_selected_feature_stats_index.length>=2 && !showSource && !enableSorting){
                    let params = {
                        "pre_selected_feature_stats_index":pre_selected_feature_stats_index,
                        "pre_selected_feature":pre_selected_feature
                    }
                    let result_package = this.hclusterSortingSelectedFeatures(params);
                    let perm = result_package["perm"];
                    let new_pre_selected_feature = [];
                    let new_pre_selected_feature_stats:any[] = [];
                    let new_pre_selected_feature_order:any[] =[];
                    //let new_pre_selected_feature_stats_index:any[] = [];
                    for(let i = 0; i<perm.length;i++){
                        new_pre_selected_feature.push(pre_selected_feature[perm[i]]);
                        new_pre_selected_feature_stats.push(pre_selected_feature_stats[perm[i]]);
                        new_pre_selected_feature_order.push(pre_selected_feature_order[perm[i]]);
                        //new_pre_selected_feature_stats_index.push(pre_selected_feature_stats_index[perm[i]].slice())
                    }
                    pre_selected_feature = new_pre_selected_feature;
                    pre_selected_feature_stats = new_pre_selected_feature_stats;
                    pre_selected_feature_order = new_pre_selected_feature_order;
                    //pre_selected_feature_stats_index = new_pre_selected_feature_stats_index.slice();
                    let sort_selected_feature_order = pre_selected_feature_order.map((d:any,i:any)=>{
                        return {
                            "index":pre_selected_feature[i],
                            "stats":pre_selected_feature_stats[i],
                            "value":d
                        }
                    })
                    sort_selected_feature_order.sort((a:any,b:any)=>{
                        return a.value < b.value ? -1: 1;
                    })
                    pre_selected_feature = sort_selected_feature_order.map((d:any)=>{
                        return d.index;
                    })
                    pre_selected_feature_stats = sort_selected_feature_order.map((d:any)=>{
                        return d.stats;
                    })
                }else if(pre_selected_feature_stats_index.length>=2 && showSource && !enableSorting){
                    
                }*/
                //console.log("after features", pre_selected_feature)
                
                //let enableSorting = 1;
                if(enableSorting){
                    let inspect_node = selectedNodeIdList[0];
                    let inspect_node_GCN_prediction_label = individual[key_model_name].graph_out.node_features[inspect_node]; 
                    let sort_selected_feature_stats = pre_selected_feature_stats.map((d:any,i:any)=>{
                        let first = 1;
                        if(pre_selected_feature_order_list[i][0] === 0){
                            first = 1;
                        }else{
                            first = 0;
                        }
                        return {
                            "index":pre_selected_feature[i],
                            "freq":d,
                            "pro": pre_selected_feature_prediction_label_distribution[i]["distribution"][inspect_node_GCN_prediction_label],
                            "first": first
                        }
                    })
                    sort_selected_feature_stats.sort((a:any,b:any)=>{
                        if(a.first > b.first){
                            return -1;
                        }else if(a.first < b.first){
                            return 1;
                        }else{
                            if(a.pro>b.pro){
                                return -1;
                            }else if(a.pro<b.pro){
                                return 1;
                            }else{
                                if(a.freq>b.freq){
                                    return -1;
                                }else{
                                    return 1;
                                }
                            }
                        }
                        //return a.value > b.value ? -1: 1;
                    })
                    pre_selected_feature = sort_selected_feature_stats.map((d:any)=>{
                        return d.index;
                    })
                    pre_selected_feature_stats = sort_selected_feature_stats.map((d:any)=>{
                        return d.freq;
                    })
                }else{
                    let sort_selected_feature_order = pre_selected_feature_order_list.map((d:any,i:any)=>{
                        return {
                            "index":pre_selected_feature[i],
                            "stats":pre_selected_feature_stats[i],
                            "value":d
                        }
                    })
                    sort_selected_feature_order.sort((a:any,b:any)=>{
                        let value1 = a.value;
                        let value2 = b.value;
                        let len1 = value1.length;
                        let len2 = value2.length;
                        let flag = 0;
                        let minlen = Math.min(len1, len2);
                        for(let i = 0; i<minlen; i++){
                            if(value1[i] < value2[i]){
                                flag = -1;
                                break;
                            }
                            if(value1[i] > value2[i]){
                                flag = 1;
                                break;
                            }
                        }
                        if(flag === 0){
                            if(len1>len2){
                                flag = -1;
                            }else if(len1< len2){
                                flag = 1;
                            }else{
                                flag = 0;
                            }
                        }
                        return flag;
                    })
                    pre_selected_feature = sort_selected_feature_order.map((d:any)=>{
                        return d.index;
                    })
                    pre_selected_feature_stats = sort_selected_feature_order.map((d:any)=>{
                        return d.stats;
                    })
                }
                selectedFeature = pre_selected_feature;
                selectedFeatureStatistics = pre_selected_feature_stats;

                // Step 4: construct matrix based on selected node id list and selectedFeature.
                for(let i = 0; i <selectedNodeIdList.length ; i++){
                    let currentSelect:any = selectedNodeIdList[i];
                    for(let j = 0;j <features[currentSelect].length;j ++){
                        let dimension = features[currentSelect][j];
                        let feature_index = selectedFeature.indexOf(dimension);
                        let currentNodeIndex = i;
                        let value = features_value[currentSelect][j];
                        let value_package:any;
                        
                        value_package = {
                            "x": feature_index,
                            "y": currentNodeIndex,
                            "value": value
                        }
                        
                        matrix.push(value_package);
                    }
                }
            }
            
        }else{
            return {"success": false}
        }
        let selectedNodeColor : any[] = [];
        for(let i = 0 ; i<selectedNodeIdList.length ; i++){
            let color = getNodeColorInfo(selectedNodeIdList[i]);
            selectedNodeColor.push(color);
        }
        let data_type = common.data_type_id;
        if(data_type === 2){
            let graph_info = common.graph_additional_info;
            let selectedFeatureLabel:any = [];
            
            if(Object.keys(graph_info).indexOf("idx_to_attr")>=0 && dataSource_select === 1){
                let idx_to_attr = graph_info.idx_to_attr;
                for(let i=0;i<selectedFeature.length; i++){
                    selectedFeatureLabel.push(idx_to_attr[selectedFeature[i]]);
                }
            }else{
                selectedFeatureLabel = selectedFeature;
            }
            
            // Graph Json ------------------------------------------------------------
            let type : any;
            if(dataSource_select === 1){
                type = "discrete";
            }else{
                type = "continuous";
            }
            
            let graph_json:any, x_axis_data : any, y_axis_data : any;
            let enable_x_axis_color : boolean = false;
            let enable_y_axis_color : boolean = false;
            let x_axis_color:any[] = [];
            let y_axis_color:any[] = [];
            
            
            x_axis_data = selectedFeatureLabel;
            y_axis_data = selectedNodeIdList;
            enable_x_axis_color = false;
            enable_y_axis_color = true;
            x_axis_color = [];
            y_axis_color = selectedNodeColor;
            
            
            let color_info : any = {}
            color_info["enable_x_axis_color"] = enable_x_axis_color;
            color_info["enable_y_axis_color"] = enable_y_axis_color;
            color_info["x_axis_color"] = x_axis_color;
            color_info["y_axis_color"] = y_axis_color;
            let display = true;
            if(node_max_index<=0){
                display = false;
            }
            let verticalSliderConfig : any = {
                "node_start_index": node_start_index,
                "node_max_index": node_max_index,
                "display": display

            }
            console.log("verticalSliderConfig", verticalSliderConfig);
            graph_json = {
                "success":true,
                "name":graph_name,
                "matrix":matrix,
                "x_axis":x_axis_data,
                "y_axis":y_axis_data,
                "distance_select": distance_select,
                "type" : type,
                "color_info": color_info,
                "selectedFeatureStatistics":selectedFeatureStatistics,
                "indentedList": indentedList,
                //"indentedTree": indentedTree,
                "showSource":showSource,
                "highlight_flag":highlight_flag,
                "verticalSliderConfig":verticalSliderConfig,
                "pieName": selected_models_list
            }
            
            return graph_json;
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }
    }
    public onAxisChange(axis_select: number) {
        this.setState({
            axis_select:axis_select
        })
    }
    public onDistanceChange(distance_select: number) {
        this.setState({
            distance_select:distance_select
        })
    }
    public onDataSourceChange(dataSource_select: number){
        this.setState({
            dataSource_select: dataSource_select
        })
    }
    public onColorEncodeChange(color_encode: number){
        this.setState({
            color_encode: color_encode
        })
    }
    public onEnableSort(enableSorting: boolean){
        this.setState({
            enableSorting: enableSorting
        })
    }
    public changeNodeStartIndex(node_start_index:number){
        this.setState({
            node_start_index:node_start_index
        })
    }
    public render() {
        let {graph_object, specificNodeIdList} = this.props;
        let common;
        if(getLayoutMode()===3){
            common = graph_object.common;
        }else{
            common = graph_object;
        }
        let explanation_type = common.graph_explaination.type;
        let indentedtreeWidth = 120;
        if(!this.props.showSource){
            indentedtreeWidth = 100;
        }
        let matrixWidth = this.props.width-indentedtreeWidth;
        let matrixRealWidth = matrixWidth - 30;
        let max_row_num_block = Math.max(1, Math.floor((matrixRealWidth) / 15));
        let gridSize = Math.floor((matrixRealWidth) / (max_row_num_block));
        let indentedtreeBarHeight = gridSize;
        let verticalSliderHeight = this.props.height - 180 - 90;
        let max_col_num_block = Math.max(1, Math.floor((verticalSliderHeight + 22) / 15));
        //console.log("max_col_num_block, verticalSliderHeight", max_col_num_block, verticalSliderHeight);
        //let FeatureMatrixHeight = 180 + max_col_num_block * indentedtreeBarHeight;
        let additional_params = {
            "max_col_num_block":max_col_num_block,
            "node_start_index":this.state.node_start_index
        }
        let feature_matrix_json = this.constructFeatureMatrixJson(graph_object, specificNodeIdList,
             this.state.axis_select, this.state.distance_select, this.state.dataSource_select, this.state.color_encode,
            this.props.select_inspect_node, this.props.showSource, this.state.enableSorting, this.props.width, this.props.height, 
            this.props.extendedMode, additional_params, this.props.selected_models_list);
        if(explanation_type == "MessagePassing" && feature_matrix_json["success"]){
            let FeatureMatrixHeight = 180 + feature_matrix_json.y_axis.length * indentedtreeBarHeight + 20;

            let verticalSliderConfig = feature_matrix_json["verticalSliderConfig"];
            
            let BrushBarChartLayoutConfig = {
                "width":this.props.width-indentedtreeWidth,
                "height":100,
                "x":indentedtreeWidth,
                "y":0,
                "max_row_num_block":max_row_num_block
            }
            let MatrixLayoutConfig = {
                "width":this.props.width-indentedtreeWidth,
                "height":FeatureMatrixHeight-180,
                "x":indentedtreeWidth,
                "y":180,
                "gridSize":gridSize,
                "max_row_num_block":max_row_num_block
            }
            let IndentedTreeLayoutConfig = {
                "width":indentedtreeWidth,
                "height":FeatureMatrixHeight-180,
                "x":0,
                "y":180,
                "barHeight":indentedtreeBarHeight
            }
            let VerticalSliderLayoutConfig = {
                "width": indentedtreeWidth - 60,
                "height": verticalSliderHeight,
                "x": 0,
                "y": 180 + 10,
                "node_start_index": verticalSliderConfig["node_start_index"],
                "node_max_index": verticalSliderConfig["node_max_index"],
                "name":"verticalslider_"+verticalSliderConfig["node_max_index"]
            }
            let onSelectSort = (e:any) =>{
                if(e === 0){
                    this.onEnableSort(false);
                }else{
                    this.onEnableSort(true);
                }
            }
            let getOptionValue = () =>{
                if(this.state.enableSorting){
                    return 1;
                }else{
                    return 0;
                }
            }
            let SortOptions = [
                [0, "Node order"],
                [1, "Frequency of features"]
            ]
            return (            
            <div >
                <div className="ViewTitle">Feature Matrix View
                <div style={{float:'right'}}>
                Sort features by:&nbsp;
                    <Select
                        placeholder="Select a sort mode."
                        value={getOptionValue()}
                        style={{ width: '120px' }}
                        onChange={onSelectSort}
                        size="small"
                    >
                        {SortOptions.map((d:any)=>(
                            <Option value={d[0]} key={d[0]}>
                                {d[1]}
                            </Option>
                        ))}
                    </Select>
                    </div>
                </div>
                <div className="ViewBox" style={{width: "100%", height:""+(this.props.height - 40)+"px", overflowX: "scroll"}}>
                    <div style={{width: '100%'}}>
                        <div style={{width: '100%', height: ""+FeatureMatrixHeight+"px"}}>
                            <svg
                                style={{ height: "100%", width:  "100%"}}
                                id="FeatureMatrixSVGChart"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                            <BrushBarChartContainer id={3} feature_matrix_json={feature_matrix_json} layout_config={BrushBarChartLayoutConfig}   />
                            <MatrixContainer id={1} feature_matrix_json={feature_matrix_json} layout_config={MatrixLayoutConfig}   />    
                            {(this.props.showSource)?
                            (<IndentedListContainer id={4} feature_matrix_json={feature_matrix_json} layout_config={IndentedTreeLayoutConfig}   />)
                            :(verticalSliderConfig["display"])?
                            (<VerticalSliderContainer id={5} feature_matrix_json={feature_matrix_json} layout_config={VerticalSliderLayoutConfig} changeNodeStartIndex={this.changeNodeStartIndex}  />):(<g />)}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>)
        }else{
            return <div style={{width: "100%", height:""+(this.props.height - 20)+"px", overflowX: "scroll"}}>
                <div className="ViewTitle">Feature Matrix View               
                </div></div>
        }
    }
}

