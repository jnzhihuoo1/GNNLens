
import * as React from "react";
import ParallelSetsContainer from '../../../container/ParallelSetsContainer';
import PSViewNodeStatisticContainer from '../../../container/PSViewNodeStatisticContainer';
import { Row , Button} from 'antd';
import {constructNeighborSet,getCoraNodeColor,getTrainColor,
    getLabelDistribution, getLabelDistribution2, cropAnchorsList, 
    getSimilarityFeatureSet, getShortestPathDistanceSet, 
    constructMetaInformation, constructSelectedMask,getNodeColorInfo,
    constructDegreeRangeList, getDegreeCategory, binningContinuousVariable, 
    getContinuousVariableCategory, getMaxComponent} from '../../../helper';
import PSSettingsModalContainer from "../../../container/PSSettingsModalContainer";
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
    changePSDimensions:any,
    selected_models_list:any,
    K_value:any
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
     

    public constructPSJson(graph_object:any, show_mode:number, CheckedList:any, 
        width:number, height:number, selected_models_list:any){
        //console.log("constructPSJson begin");
        console.log("constructPSJson", graph_object);
        let CheckedList_str = CheckedList.join("_");
        let Selected_models_str = selected_models_list.join("_");
        let common = graph_object.common;
        let individual = graph_object.individual;
         
        
        
        if(selected_models_list.length === 0){
            console.log("No selected models");
            return {"success": false};
        }
        let key_model_name = selected_models_list[0];
        let graph_out = individual[key_model_name].graph_out;
        let graph_name = common.name+"_"+common.dataset_id+"_"+(show_mode)+"_"+common.data_type_id+"_CheckedList_"+CheckedList_str+
        "_CheckedList_End_"+width+"_"+height+"_"+this.props.K_value + "SELECTED_MODEL_"+Selected_models_str+"_SELECTED_MODEL_END_";

        let graph_in = common.graph_in;
        let graph_target = common.graph_target;
        let graph_explaination = common.graph_explaination;
        let explaination_type = graph_explaination.type;
        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        let data_type = common.data_type_id;
        let NeighborSet = constructNeighborSet(graph_in);
        let mask = common.mask;
        let train_mask_set = new Set(common.mask.train);

        if(data_type === 2){
            let node_num = graph_target.node_features.length;
            let num_classes = common.graph_additional_info.num_class;
            let selected_mask = constructSelectedMask(node_num, CheckedList, mask);
            let models_list = graph_object.individual_model_names;
            //console.log("Mask",this.state.checkedList, selected_mask);
            // 1. Calculate degree, one_hop_accuracy, cn_consistency, SPD, KFS
            let meta_package:any = constructMetaInformation(node_num,NeighborSet,graph_target.node_features, graph_out.node_features)
            //console.log("shortest_path_distance, selected_mask, node_num, NeighborSet, mask.train", selected_mask, node_num, NeighborSet, mask.train);
            let enableSPD = true;
            let enableKFS = true;
            let enableK_settings = true; // enable setting k values.
            let shortest_path_distance_package:any, feature_similarity_list:any;
            if(enableSPD){
                shortest_path_distance_package = common.graph_additional_info.SPD;
            }else{
                shortest_path_distance_package = getShortestPathDistanceSet(selected_mask, node_num, NeighborSet, mask.train);
            }
            if(enableKFS){
                feature_similarity_list = common.graph_additional_info.KFS;
            }else{
                feature_similarity_list = getSimilarityFeatureSet(selected_mask, mask.train, graph_in.feature, graph_in.feature_value, graph_target.node_features);
            }
            let degree_list = meta_package["degree_list"];
            let degree_range_list = constructDegreeRangeList(degree_list.slice());
            let one_hop_accuracy_list = meta_package["one_hop_accuracy_list"];
            let cn_consistency_list = meta_package["cn_consistency_list"];


            let PSData:any = [];
            //let P1_name = individual.GCN.real_model_name;
            //let P2_name = individual.MLP.real_model_name;
            //let P3_name = individual.GCN_Identity_features.real_model_name;
            let pie_name = selected_models_list;
            let P1_correctness = key_model_name+"_correctness";
            let All_correctness = [];
            for(let i = 0; i<models_list.length; i++){
                All_correctness.push(models_list[i] + "_correctness")
            }
            //let P2_correctness = P2_name+"_correctness";
            //let P3_correctness = P3_name+"_correctness";
            let P1_one_hop_accuracy = key_model_name+"_one_hop_accuracy";
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
            let PSColumns = ["Label",P1_one_hop_accuracy,"Degree",Distance_name,
            CGTNGT_name,CGTNPT_name,CPTNGT_name,CPTNPT_name,
            SPD_consistency_name,KFS_consistency_name,"Confidence"];
            for(let i = 0; i<All_correctness.length; i++){
                PSColumns.push(All_correctness[i]);
            }
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
            let P1_prediction_label = key_model_name + "_Prediction_Label";
            let P1_confidence = key_model_name + "_Confidence";
            // 2. Prepare node_json.
            for(let i = 0; i<selected_mask.length;i++){
                let index = selected_mask[i];
                let node_json:any = {};
                let ground_truth_label = graph_target.node_features[index];
                let gcn_prediction_label = graph_out.node_features[index];
                let gcn_confidence = graph_out.output_vector[index][gcn_prediction_label];
                //let mlp_prediction_label = individual.MLP.graph_out.node_features[index];
                //let gcn_identity_features_prediction_label = individual.GCN_Identity_features.graph_out.node_features[index];
                
                
                
                node_json["Data_id"] = index;
                

                // 2.1 Color
                node_json["Color"] = getNodeColorInfo(index, graph_target, individual, selected_models_list, train_mask_set);
                //node_json["Rule"] = ""+satisfied_rule_id[index];

                // 2.2 SPD
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
                
                // 2.3 KFS
                if(enableKFS){
                    node_json["Topkfs_node_info"] = feature_similarity_list[index]["train_nodes"];
                    node_json["Topkfs_nodes"] = feature_similarity_list[index]["details"];
                    if(enableK_settings){
                        node_json["Topkfs_nodes"] = cropAnchorsList(node_json["Topkfs_nodes"],this.props.K_value);
                        node_json["Topkfs_node_info"] = getLabelDistribution2(node_json["Topkfs_nodes"], num_classes);
                    }
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

                
                
                
                // 2.4 CN consistency + degree
                node_json["CN_consistency"] = cn_consistency_list[index];
                node_json["Degree"] = getDegreeCategory(degree_list[index], degree_range_list);//""+degree_list[index];
                node_json["Real_Degree"] = degree_list[index];
                //if(degree_list[index] > 7){
                //    node_json["Degree"] = ">7";
               // }
                

                // 2.5 Ground truth
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

                // 2.6 Model prediction results and confidence.

                //node_json[P1_prediction_label] =  ""+gcn_prediction_label;
                node_json[P1_confidence] = gcn_confidence;
                //node_json["GCN(w/o_adj)_Prediction_Label"] = ""+mlp_prediction_label;
                //node_json["GCN(w/o_features)_Prediction_Label"] = ""+gcn_identity_features_prediction_label;
                //node_json[P2_correctness] = mlp_prediction_label === ground_truth_label?correct_label:wrong_label;
                //node_json[P3_correctness] = gcn_identity_features_prediction_label === ground_truth_label?correct_label:wrong_label;
                for(let j = 0; j<All_correctness.length; j++){
                    let model_name = models_list[j];
                    let prediction_label = individual[model_name].graph_out.node_features[index];
                    node_json[model_name + "_Prediction_Label"] = prediction_label;
                    node_json[All_correctness[j]] = prediction_label === ground_truth_label?correct_label:wrong_label;
                }
                if(ground_truth_label===gcn_prediction_label){
                    //node_json[P1_correctness] = correct_label;
                    whole_correct_num = whole_correct_num + 1;
                    ground_truth_label_stats[ground_truth_label]["correct_num"] = 
                    ground_truth_label_stats[ground_truth_label]["correct_num"] + 1;

                }else{
                    //node_json[P1_correctness] = wrong_label;
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


                // 2.7 Push node_json to PSData
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
                // TODO
                GCN_Confidence_list.push(node_json[P1_confidence]);
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
                // TODO
                node_json["Confidence"] = getContinuousVariableCategory(node_json[P1_confidence], GCN_Confidence_range_list);

            }

            //console.log("len, shortest_path_label_accuracy, rate", selected_mask.length, shortest_path_label_accuracy, shortest_path_label_accuracy / selected_mask.length );
            PSData["columns"] = PSColumns;
            PSData["default_columns"] = Default_PSColumns;

            // Calculate stats
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
                    "pie_name":pie_name,
                    "graph_additional_info":common.graph_additional_info
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
        
        let PSWidth = this.props.width - 10;
        let PSHeight = this.props.height - 60;
        let PSJson:any = this.constructPSJson(graph_object,show_mode, this.props.checkedList, PSWidth, PSHeight, this.props.selected_models_list);
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
        
    }
}

