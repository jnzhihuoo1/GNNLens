
import * as React from "react";
//import ForceDirectedGraph from "./ForceDirectedGraph";
//import ForceDirectedGraphCanvas from "./ForceDirectedGraphCanvas";

import { Select, Button,  Tag, InputNumber } from 'antd';
import {getInfectionNodeColor, getInfectionEdgeColor, getCoraNodeColor, 
    constructNeighborSet,getLayoutMode,getTrainColor, getNodeStatisticStr} from '../../../helper';
import { SettingOutlined } from '@ant-design/icons';
import GraphViewSettingsModalContainer from '../../../container/GraphViewSettingsModalContainer';
import ForceDirectedGraphCanvasContainer from '../../../container/ForceDirectedGraphCanvasContainer';
const Option = Select.Option;

//const d3 = require("d3");

export interface IProps {
    graph_object:any,
    show_mode:number, 
    explained_node:number, 
    onExplainNodeChange:any, 
    onShowModeChange:any,
    model:number,
    modelList:any[],
    selectedNodeIdList:any[],
    selectedMessagePassingNodeIdList:any[],
    showSource: boolean,
    width: number,
    height: number,
    changeSpecificNodeIdList : any,
    changeSelectInspectNode:any,
    select_inspect_node : number,
    changePrevGraphJson: any,
    changeShowSource:any,
    extendedMode: any,
    changeExtendedMode:any,
    GraphViewSettingsModal_visible:any,
    changeGraphViewSettingsModal_visible:any
}
export interface IState {
    enableForceDirected: boolean,
}

export default class GraphView extends React.Component<IProps, IState>{
    public prevGraphJson:any = null;
    constructor(props:IProps) {
        super(props);
        this.onEnableForceDirected = this.onEnableForceDirected.bind(this);
        this.onExtendedModeChange = this.onExtendedModeChange.bind(this);
        this.onNodeClick = this.onNodeClick.bind(this);
        this.onChangeSelectInspectNode = this.onChangeSelectInspectNode.bind(this);
        this.state = {
            enableForceDirected : false,
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
     public onNodeClick(node_id:number){
        let {showSource} = this.props;
        //console.log("onNodeClick node_id, showSource, select_inspect_node", node_id, showSource, select_inspect_node);
        if(showSource === false){
            this.props.changeSelectInspectNode(node_id);
            this.props.changeShowSource(true);
            this.props.changeExtendedMode(3);
        }else{
            //if(select_inspect_node === node_id){
            //    this.props.changeShowSource(false);
            //}else{
                this.props.changeSelectInspectNode(node_id);
            //}
        }
        
         
     }
     public constructGraphJson(graph_object:any, show_mode:number, explained_node:number, 
        onExplainNodeChange:any, onShowModeChange:any, selectedNodeIdList:any, enableForceDirected:boolean, 
        select_inspect_node:number, showSource:boolean, embedding_layout_select:number, width:number, height:number){
        let selectStr = selectedNodeIdList.join("_");
        //let {width, height} = this.props;

        let common = graph_object;
        let individual = graph_object;
        let graph_name; 
        let layout_mode = getLayoutMode();
        if(layout_mode === 3){
            common = graph_object.common;
            individual = graph_object.individual;
            graph_name = common.name+"_"+common.dataset_id+"_"+(show_mode)+"_"+common.data_type_id+"_SELECTED_"+selectStr+"_SELECTEDEND_"+enableForceDirected+"_"+width+"_"+height+"_"+embedding_layout_select+"_";
        }else{
            graph_name = graph_object.name+"_"+graph_object.dataset_id+"_"+(graph_object.model)
            +"_"+graph_object.explain_id 
            +"_"+(graph_object.graph)+"_"+(show_mode)+"_"+graph_object.data_type_id+"_SELECTED_"+selectStr+"_SELECTEDEND_"+enableForceDirected+"_"+width+"_"+height+"_";
        }

        

        
        if(show_mode == 4){
            graph_name = graph_name+"_"+explained_node;
        }
        let graph_in = common.graph_in;
        let graph_target = common.graph_target;
        let graph_explaination = common.graph_explaination;
        let graph_layout = common.graph_layout;
        let mask = common.mask;
        let train_mask_set = new Set(mask.train);
        let graph_out ;

        if(layout_mode === 3){
            graph_out = {
                "GCN": individual["GCN"]["graph_out"],
                "MLP": individual["MLP"]["graph_out"],
                "GCN_Identity_features": individual["GCN_Identity_features"]["graph_out"]
            }
        }else{
            graph_out = common.graph_out
        }
        if(selectedNodeIdList.length === 0){
            //console.log("The num of SelectedNode is 0")
            if(layout_mode === 3){
                selectedNodeIdList = []
                for(let i = 0; i<graph_layout.length;i++){
                    selectedNodeIdList.push(i);
                }
            }else{
                return {"success":false};
            }
            
        }
        let new_graph_layout;// = graph_layout;

        if(embedding_layout_select>=0){
            let embedding = common.embedding;
            let mapping:any = {
                "0": "input",
                "1": "hidden",
                "2": "output"
            }
            new_graph_layout = embedding[mapping[""+embedding_layout_select]];
        }else{
            new_graph_layout = graph_layout;
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
        function transform_graphlayout(graph_layout:any[]){
            if(graph_layout.length === 0){
                return graph_layout;
            }else{
                let bounding_box = get_boundingbox(graph_layout);
                //let canvas_centerx = 300;
                //let canvas_centery = 300;
                //let width = Swidth;
                //let height = Sheight;
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

        

        let enable_forceDirected = enableForceDirected;
        if(new_graph_layout.length > 0){
            //enable_forceDirected = false;
            new_graph_layout = transform_graphlayout(new_graph_layout);
            //console.log("Transforming graph layout...")
        }else{
            
        }
        let data_type = common.data_type_id;
        let task = common.task;
        function transform_node_feature(value:number, max:number, min:number){
            return (value - min) / (max-min+1e-16);
        }
        if(data_type == 1){
            let node_num = graph_in.node_features.length;
            let edge_num = graph_in.edge_features.length;
            let source_list = graph_in.senders;
            let target_list = graph_in.receivers;
            
            let nodes_json = [];
            let links_json = [];
            let links_color_json = [];
            let color_mode = 1;
            if(graph_explaination.type==="LRP" && task == "node_classification"){
                color_mode = 0;
            }
            if(task == "graph_classification"){
                color_mode = 2;
                if(show_mode == 2 || show_mode == 3){
                    console.log("out of range show_mode for graph_classification task", show_mode);
                    onShowModeChange(1);
                    return {"success":false};
                }
                
            }
            if(explained_node >= node_num){
                console.log("out of range explained_node:" , explained_node );
                onExplainNodeChange(0);
                return {"success":false}
            }
    
            let node_max, node_min, edge_max, edge_min;
            node_max = node_min = edge_max = edge_min = 0;
            if(task == "graph_classification"){
                explained_node = 0;
                let node_explain = graph_explaination.node_importance[explained_node];
                let edge_explain = graph_explaination.edge_importance[explained_node];
                let node_absmax = 0;
                let edge_absmax = 0;
                for(let i = 0 ; i < node_explain.length; i++){
                    if(node_absmax < Math.abs(node_explain[i])){
                        node_absmax = Math.abs(node_explain[i]);
                    }
                }
                for(let i = 0 ; i < edge_explain.length; i++){
                    if(edge_absmax < Math.abs(edge_explain[i]))
                    {
                        edge_absmax = Math.abs(edge_explain[i]);
                    }
                }
                node_max = node_absmax;
                node_min = -node_absmax;
                edge_max = edge_absmax;
                edge_min = -edge_absmax;
            }else{
                let node_explain = graph_explaination.node_importance[explained_node];
                let edge_explain = graph_explaination.edge_importance[explained_node];
                
                node_max = Math.max(...node_explain);
                node_min = Math.min(...node_explain);
                edge_max = Math.max(...edge_explain);
                edge_min = Math.min(...edge_explain);
            }
            
            
            for(let i = 0; i<node_num;i++){
                let color = "#999";
                if(show_mode == 1){
                    color = getInfectionNodeColor(show_mode,graph_in.node_features[i]);
                }else if(show_mode == 2){
                    color = getInfectionNodeColor(show_mode,graph_target.node_features[i]);
                }else if(show_mode == 3){
                    color = getInfectionNodeColor(show_mode,graph_out.node_features[i]);
                }else if(show_mode == 4){
                    let feature = graph_explaination.node_importance[explained_node][i];
                    
                    if(graph_explaination.type==="SA" || graph_explaination.type==="GBP" || task == "graph_classification"){
                        feature = transform_node_feature(feature, node_max, node_min);
                    }   
    
                    color = getInfectionNodeColor(show_mode,feature, color_mode);
                }
                let node_object:any = {
                    "id":i,
                    "group":1,
                    "color":color
                    
                }

                if(enable_forceDirected === false){
                    node_object["x"] = graph_layout[i][0];
                    node_object["y"] = graph_layout[i][1];
                }
                nodes_json.push(node_object);
            }
            for(let i = 0; i<edge_num;i++){
                let link_color;
                if(show_mode == 1 || show_mode == 2 || show_mode == 3){
                    link_color = getInfectionEdgeColor(show_mode,graph_in.edge_features[i]);
                }else{
                    let feature = graph_explaination.edge_importance[explained_node][i];
                    
                    if(graph_explaination.type==="SA" || graph_explaination.type==="GBP" ){
                        feature = transform_node_feature(feature, edge_max, edge_min);
                    }  
                    link_color = getInfectionEdgeColor(show_mode, feature);
                }
                if(links_color_json.indexOf(link_color)>=0){
                    
                }else{
                    links_color_json.push(link_color);
                }
                links_json.push({
                    "source": source_list[i],
                    "target": target_list[i],
                    "value":1,
                    "color":link_color
                })
            }
            let graph_json = {
                "success":true,
                "name":graph_name,
                "nodes":nodes_json,
                "links":links_json,
                "links_color":links_color_json,
                "nodenum":node_num,
                "edgenum":edge_num,
                "enable_forceDirected":enable_forceDirected
            }
            return graph_json;
        }else if(data_type == 2){
            let source_list = graph_in.senders;
            let target_list = graph_in.receivers;
            
            let node_num = graph_target.node_features.length;
            let enablePrevGraphLayout = false;
            let prevGraphJson = this.prevGraphJson;
            if(prevGraphJson && prevGraphJson["success"]){
                if(prevGraphJson["nodes"].length === node_num){
                    enablePrevGraphLayout = true;
                }
            }
            //let node_num = selectedNodeIdList.length;
            let edge_num = graph_in.senders.length;
            let nodes_json = [];
            let links_json = [];
            let links_color_json = [];
            //var color_func = d3.scaleOrdinal(d3.schemeCategory10);
            for(let i = 0; i<node_num;i++){
                let label ;
                let index = i;
                //let index = selectedNodeIdList[i];
                /*if(show_mode == 3){
                    label = graph_out.node_features[index];
                }else if(show_mode == 1 || show_mode == 2){
                    label = graph_target.node_features[index];
                }else if(show_mode == 5){
                    label = graph_out.node_features[index] === graph_target.node_features[index];
                }
                let color = getCoraNodeColor(label, show_mode);*/
                let color:any ;
                let real_color:any;
                let highlight = 1;
                if(layout_mode === 3){
                    let ground_truth_label = graph_target.node_features[index];
                    label = ground_truth_label;
                    let GCN_prediction_label = graph_out.GCN.node_features[index];   //
                    let MLP_prediction_label = graph_out.MLP.node_features[index]; 
                    let GCN_Identity_features_prediction_label = graph_out.GCN_Identity_features.node_features[index]; 
                    // Ground Truth Color / Prediction Color
                    color = [getCoraNodeColor(ground_truth_label, 2), 
                        getCoraNodeColor(GCN_prediction_label,3),
                        getCoraNodeColor(MLP_prediction_label,3),
                        getCoraNodeColor(GCN_Identity_features_prediction_label,3),
                        getTrainColor(index, train_mask_set)
                    ];    //
                    real_color = color.slice();
                    if(selectedNodeIdList.indexOf(index)>=0){
                
                    }else{
                        color = ["#ddd","#ddd","#ddd","#ddd","#ddd"];
                        highlight = 0;
                    }
                }else{
                    let ground_truth_label = graph_target.node_features[index];
                    label = ground_truth_label;
                    let prediction_label = graph_out.node_features[index];   //
                    //let TF_label = (graph_out.node_features[index] === graph_target.node_features[index])?1:0;   //
                    // Ground Truth Color / Prediction Color
                    color = [   getCoraNodeColor(ground_truth_label, 2), 
                                getCoraNodeColor(prediction_label, 3), 
                                getCoraNodeColor(prediction_label, 3),
                                getCoraNodeColor(prediction_label, 3)];    //
                    real_color = color.slice();
                    if(selectedNodeIdList.indexOf(index)>=0){
                
                    }else{
                        color = ["#ddd","#ddd","#ddd","#ddd"];
                    }
                }
                let radius = 3;
                if(index === select_inspect_node && showSource === true){
                    radius = 6;
                }
                let node_object:any = {
                    "id":index,
                    "group":label,
                    "color":color,
                    "real_color":real_color,
                    "radius":radius,
                    "highlight":highlight
                }
                
                if(enablePrevGraphLayout){
                    node_object["x"] = prevGraphJson["nodes"][i]["x"];
                    node_object["y"] = prevGraphJson["nodes"][i]["y"];
                }else if(enable_forceDirected === false){
                    node_object["x"] = new_graph_layout[i][0];
                    node_object["y"] = new_graph_layout[i][1];
                }
                nodes_json.push(node_object);
            }
            for(let i = 0; i<edge_num;i++){
                let link_color = "#eee";
                if(selectedNodeIdList.indexOf(source_list[i])>=0){
                    if(selectedNodeIdList.indexOf(target_list[i])>=0){
                        link_color = "#bbb";
                    }
                }
                if(links_color_json.indexOf(link_color)>=0){
                    
                }else{
                    links_color_json.push(link_color);
                }
                
                links_json.push({
                    "source": source_list[i],
                    "target": target_list[i],
                    "value":1,
                    "color":link_color,
                    "real_color":"#bbb"
                })
                
            }
            let getColorLegend = () =>{
                let graph_info = common.graph_additional_info;
                let num_class = graph_info.num_class;
                let label = [];
                if(Object.keys(graph_info).indexOf("idx_to_class")>=0){
                    let idx_to_class = graph_info.idx_to_class;
                    for(let i = 0; i< num_class;i++){
                        label.push({
                            "text":""+i+":"+idx_to_class[i],
                            "color":getCoraNodeColor(i,2)
                        })
                    }
                }else{
                    for(let i = 0; i< num_class;i++){
                        label.push({
                            "text":i,
                            "color":getCoraNodeColor(i,2)
                        })
                    }
                }
                return label;
            }
            let P1_name = individual.GCN.real_model_name;
            let P2_name = individual.MLP.real_model_name;
            let P3_name = individual.GCN_Identity_features.real_model_name;
            let pie_name = [P1_name, P2_name, P3_name];
            let graph_json = {
                "success":true,
                "name":graph_name,
                "nodes":nodes_json,
                "links":links_json,
                "links_color":links_color_json,
                "nodenum":node_num,
                "edgenum":edge_num,
                "enable_forceDirected":enable_forceDirected,
                "colorLegend":getColorLegend(),
                "pieLegend":{
                    "pie_name":pie_name
                }
            }
            return graph_json;
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }


        
    }
    public onEnableForceDirected(checked:boolean){
        this.setState({
            enableForceDirected: checked
        })
    }
    public onExtendedModeChange(e:any){
        /*this.setState({
            extendedMode: e.target.value
        })*/
        this.props.changeExtendedMode(e);
        /*this.setState({
            extendedMode: e
        })*/
    }
    public constructExtendedSelectedNodeIdList(selectedNodeIdList:any, NeighborSet:any){
        if(selectedNodeIdList.length === 0){
            return [];
        }else{
            
            let new_selectedNodeIdList = selectedNodeIdList.slice();
            for(let i = 0 ; i<selectedNodeIdList.length; i++){
                let nodeId = selectedNodeIdList[i];
                new_selectedNodeIdList = new_selectedNodeIdList.concat(NeighborSet[nodeId])
            }

            new_selectedNodeIdList = Array.from(new Set(new_selectedNodeIdList));
            return new_selectedNodeIdList;
        }
        
    }
    public onChangeSelectInspectNode(node_id:any, node_num:number){
        let new_node_id:number = parseInt(node_id);
        if(!new_node_id || new_node_id<0){
            new_node_id = 0;
        }
        if(new_node_id>=node_num){
            new_node_id = node_num - 1;
        }
        console.log("graphview, new_node_id", new_node_id);
        this.props.changeSelectInspectNode(new_node_id);
    }
    public showGraphViewSettingModal(){
        this.props.changeGraphViewSettingsModal_visible(true);
    }
    public render() {
        let {graph_object, show_mode, explained_node, onExplainNodeChange, onShowModeChange
            , model, modelList, selectedNodeIdList, selectedMessagePassingNodeIdList, showSource, select_inspect_node, width, height, extendedMode} = this.props;
        //console.log("GraphView", graph_object);
        //console.log("GraphView", selectedNodeIdList);
        let onNodeClick = this.onNodeClick;
        let specificNodeIdList = selectedNodeIdList;
        if(showSource){
            //specificNodeIdList = selectedMessagePassingNodeIdList;
            specificNodeIdList = [select_inspect_node];
        }

        let common = graph_object;
        if(getLayoutMode() === 3){
            common = graph_object.common;
        }

        // One Hop
        let graph_in = common.graph_in;
        let NeighborSet = constructNeighborSet(graph_in);
        if(extendedMode === 2){
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
        }else if(extendedMode === 3){
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
        }
        this.props.changeSpecificNodeIdList(specificNodeIdList);
        /*function find_model_name(model:number | null){
            if(model){
                for(let i = 0; i < modelList.length; i++){
                    if(modelList[i].id === model){
                        return modelList[i].name;
                    }
                }
            }
            return "";
        } */           
        //console.log("GraphView showSource", showSource);


        let embedding_layer_select:number = -1;
        let ForceDirectedWidth = width - 10;
        let ForceDirectedHeight = height - 50;
        let graph_json:any = this.constructGraphJson(graph_object, show_mode, explained_node, 
            onExplainNodeChange, onShowModeChange, specificNodeIdList, this.state.enableForceDirected, 
            select_inspect_node,showSource, embedding_layer_select, ForceDirectedWidth, ForceDirectedHeight);
        graph_json["NeighborSet"] = NeighborSet;
        if(graph_json["success"]){
            this.prevGraphJson = graph_json;
            //this.props.changePrevGraphJson(this.prevGraphJson);
        }
        
            
        //console.log("GraphView graph_json", graph_json)
        if(graph_json["success"]){
            //let nodenum = graph_object.graph_in.node_features.length;
            let nodenum: number = graph_json["nodenum"];
            let task = common.task;
            let options  = [
                [1,"Input Feature"],
                [2,"Ground Truth"],
                [3,"Model Output"],
                [4,"Explaination"],
                [5,"True / False"]];
            if(task == "node_classification"){
                if(common.data_type_id == 2){
                    options = [
                        [1,"Input Feature"],
                        [2,"Ground Truth"],
                        [3,"Model Output"],
                        [5,"True / False"]];
                }
            }else if(task == "graph_classification"){
                options = [
                    [1,"Input Feature"],
                    [4,"Explaination"]]
            }
            let extendedOptions = [
                [1,"None"],
                [2,"One Hop"],
                [3,"Two Hop"]];
            let generateExplainSelect = (nodenum:number, explained_node:number, onExplainNodeChange:any) =>{
                let arr = [];
                for(let i = 0; i<nodenum; i++){
                    arr.push(i);
                }
                return (<Select
                        placeholder="Select an explain mode"
                        value={explained_node}
                        style={{ width: '100px' }}
                        onChange={onExplainNodeChange}
                    >
                        { arr.map((value:number)=>(
                                <Option key={value} value={value}>{value}</Option>
                        ))}
                        
                    </Select>);
            }
            /*
            let generateMoreInfo = (task:any) => {
                
                if(task == "graph_classification"){
                    return <div> Ground Truth: <Tag>{graph_object.graph_target.global_features[0]} </Tag>
                    Model Output: <Tag>{graph_object.graph_out.global_features[0]}</Tag> </div>
                }else{
                    return <div />
                }
            }*/
            let generateTagColor = () =>{
                let graph_info = common.graph_additional_info;
                let num_class = graph_info.num_class;
                let label = [];
                if(Object.keys(graph_info).indexOf("idx_to_class")>=0){
                    let idx_to_class = graph_info.idx_to_class;
                    for(let i = 0; i< num_class;i++){
                        label.push(idx_to_class[i]);
                    }
                }else{
                    for(let i = 0; i< num_class;i++){
                        label.push(i);
                    }
                }
                let tag = label.map((d:any,i:any)=>{
                    return <Tag key={i} color={getCoraNodeColor(i,2)}>{d}</Tag>
                })
                return tag;
            }
            /**
             * {(show_mode==1||show_mode==2||show_mode==3)?(generateTagColor()):""}
                    {(show_mode==5)? (<Tag color={getCoraNodeColor(1,5)}>True</Tag>):""}
                    {(show_mode==5)? (<Tag color={getCoraNodeColor(0,5)}>False</Tag>):""}
                    {show_mode==4&&task == "node_classification"?"Explained Node:":""}
                    {show_mode==4&&task == "node_classification"?generateExplainSelect(nodenum, explained_node, onExplainNodeChange):<div/>}
                    
             */
            let stopLayout = () =>{
                this.onEnableForceDirected(false);
            }
            let startLayout = () =>{
                this.onEnableForceDirected(true);
            }
            
            return (            
            <div style={{width: "100%", height:""+(this.props.height - 10)+"px", overflowX: "hidden"}}>
                <div className="ViewTitle">Graph View
                    <div style={{float:'right'}}>
                    {(showSource)?[<span key={"span"+1}>Id:</span>,
                    <InputNumber min={0} max={nodenum} size="small" value={select_inspect_node} onChange={(e:any)=> {this.onChangeSelectInspectNode(e,nodenum);}} />,
                    <span key={"span"+3}>&nbsp;</span>,
                    <Button size="small" onClick={()=>{this.props.changeShowSource(false);this.props.changeExtendedMode(1);}}>X</Button> ]:[<span key={"span"+2}></span>]}
                    {/*<Checkbox checked={this.state.enableForceDirected} onChange={this.onEnableForceDirected}>Enable Force Directed Layout</Checkbox>*/}
                    <GraphViewSettingsModalContainer />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    Extended:&nbsp;
                    <Select
                        placeholder="Select an extended mode"
                        value={extendedMode}
                        style={{ width: '90px' }}
                        onChange={this.onExtendedModeChange}
                        size="small"
                    >
                        {extendedOptions.map((d:any)=>(
                            <Option value={d[0]} key={d[0]}>
                                {d[1]}
                            </Option>
                        ))}
                        </Select>
                   {/* <Radio.Group onChange={this.onExtendedModeChange} value={this.state.extendedMode}>
                        {extendedOptions.map((d:any)=>(
                            <Radio value={d[0]} key={d[0]}>
                                {d[1]}
                            </Radio>
                        ))}
                        </Radio.Group> */}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {(this.state.enableForceDirected)?
                        <Button type="primary" size="small" onClick={stopLayout}>Stop Layout</Button>:
                        <Button type="default" size="small" onClick={startLayout}>Start Layout</Button>}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="default" size="small" onClick={()=>{this.showGraphViewSettingModal()}} ><SettingOutlined /></Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    #Nodes: <Tag>{getNodeStatisticStr(specificNodeIdList.length, nodenum)} </Tag>
                    {/*Legend:&nbsp;(show_mode==1||show_mode==2||show_mode==3)?(generateTagColor()):""*/}
                    
                    </div>
                </div>
                {/*Model name: <Tag>{find_model_name(model)}</Tag>   
                Graph name: <Tag>{graph_object.name}</Tag>  {generateMoreInfo(task)}*/}
                <div className="ViewBox">
                    <div>{/*Select Show Mode:
                    <Select
                        placeholder="Select a show mode"
                        value={show_mode}
                        style={{ width: '25%' }}
                        onChange={onShowModeChange}
                    >
                        {options.map((d:any)=>(
                            <Option value={d[0]} key={d[0]}>
                                {d[1]}
                            </Option>
                        ))}
                        </Select>*/}
                    
                    
                    {/*<Checkbox checked={this.state.enableOneHop} onChange={this.onEnableOneHop}>Enable One Hop Extended</Checkbox>*/}
                    </div>
                    
                    <div
                    style={{
                        width: '100%',
                        }}
                    >
                    <ForceDirectedGraphCanvasContainer graph_json={graph_json} width={ForceDirectedWidth} height={ForceDirectedHeight} onNodeClick={onNodeClick}/>
                    </div>
                </div>
            </div>
            )}else{
                return <div />
            }
    }
}

