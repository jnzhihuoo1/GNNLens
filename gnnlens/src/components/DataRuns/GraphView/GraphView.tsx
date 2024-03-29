
import * as React from "react";
//import ForceDirectedGraph from "./ForceDirectedGraph";
//import ForceDirectedGraphCanvas from "./ForceDirectedGraphCanvas";

import { Select, Button,  Tag, InputNumber } from 'antd';
import {getCoraNodeColor, 
    constructNeighborSet,getTrainColor, getNodeStatisticStr, 
    transform_graphlayout, skew_weight} from '../../../helper';
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
    changeGraphViewSettingsModal_visible:any,
    selected_models_list:any
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
         selectedNodeIdList:any, enableForceDirected:boolean, 
        select_inspect_node:number, showSource:boolean, width:number, height:number, selected_models_list:any, subgraph_index:number){
        
        
        
        
        let selectedmodelsStr = selected_models_list.join("_");
        //let {width, height} = this.props;
        let common = graph_object.common;
        let individual = graph_object.individual;
        let subgraphs = graph_object.subgraphs;
        let sp_subgraphs;
        let subgraph_list = graph_object.subgraph_list;
        let subgraph_name = "";
        let subgraph_mode = false;
        if(subgraph_index >= 0){
            subgraph_name = subgraph_list[subgraph_index];
            if(Object.keys(subgraphs[subgraph_name]["node_subgraphs"]).indexOf(""+select_inspect_node)>=0){
                sp_subgraphs = subgraphs[subgraph_name]["node_subgraphs"][select_inspect_node];
                selectedNodeIdList = sp_subgraphs["nodes"];
                subgraph_mode = true;
            }
        }else{
            subgraph_mode = false;
        }
        console.log("subgraph_mode", subgraph_mode);
        let selectStr = selectedNodeIdList.join("_");
        let graph_name = common.name+"_"+common.dataset_id+"_"+(show_mode)+"_"+
        common.data_type_id+"_SELECTED_"+selectStr+"_SELECTEDEND_"+enableForceDirected+"_"+width+"_"+height+"_SELECTMODEL_"+selectedmodelsStr+"_SELECTMODELEND_"
        +subgraph_index;

        if(show_mode == 4){
            graph_name = graph_name+"_"+explained_node;
        }
        let graph_in = common.graph_in;
        let graph_target = common.graph_target;
        let graph_layout = common.graph_layout;
        let mask = common.mask;
        let train_mask_set = new Set(mask.train);
        if(selectedNodeIdList.length === 0){
            selectedNodeIdList = []
            for(let i = 0; i<graph_layout.length;i++){
                selectedNodeIdList.push(i);
            }
        }
        let new_graph_layout;// = graph_layout;
        new_graph_layout = graph_layout;
        let enable_forceDirected = enableForceDirected;
        if(new_graph_layout.length > 0){
            new_graph_layout = transform_graphlayout(new_graph_layout, width, height);
        }else{
            
        }
        let data_type = common.data_type_id;

        if(data_type == 2){
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
                let title = "" + index;
                let real_color:any;
                let highlight = 1;
                let node_weight = 1;
                let ground_truth_label = graph_target.node_features[index];
                label = ground_truth_label;
                let color:any = [getCoraNodeColor(ground_truth_label, 2)];
                for(let j = 0; j<selected_models_list.length; j++){
                    let prediction_label = individual[selected_models_list[j]].graph_out.node_features[index];
                    color.push(getCoraNodeColor(prediction_label,3))
                }
                color.push(getTrainColor(index, train_mask_set));
                real_color = color.slice();
                let subnode_index = selectedNodeIdList.indexOf(index);
                if(subnode_index>=0){
                    if(subgraph_mode){
                        node_weight = sp_subgraphs["nweight"][subnode_index];
                        title = title + ": " + node_weight.toFixed(4);
                        //console.log("node_weight", node_weight)
                    }
                }else{
                    color = ["#ddd","#ddd","#ddd","#ddd","#ddd"];
                    highlight = 0;
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
                    "highlight":highlight,
                    "node_weight":skew_weight(node_weight, 0, 1),
                    "title":title
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
                let eweight = 0.1;

                if(!subgraph_mode){
                    if(selectedNodeIdList.indexOf(source_list[i])>=0){
                        if(selectedNodeIdList.indexOf(target_list[i])>=0){
                            link_color = "#bbb";
                        }
                    }
                }else{
                    let selectedEdgeIdList = sp_subgraphs["eids"];
                    let ceid = selectedEdgeIdList.indexOf(i);
                    if(ceid>=0){
                        link_color = "#bbb";
                        //eweight = sp_subgraphs["eweight"][ceid] * 0.6;
                        eweight = 0.1;
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
                    "real_color":"#bbb",
                    "weight":skew_weight(eweight)
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
            //let P1_name = individual.GCN.real_model_name;
            //let P2_name = individual.MLP.real_model_name;
            //let P3_name = individual.GCN_Identity_features.real_model_name;
            let pie_name = selected_models_list;
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
        let {graph_object, show_mode, explained_node, selectedNodeIdList,selected_models_list,
             showSource, select_inspect_node, width, height, extendedMode} = this.props;

        let onNodeClick = this.onNodeClick;
        let specificNodeIdList = selectedNodeIdList;
       

        let common = graph_object.common;
        let subgraph_list = graph_object.subgraph_list;
        // One Hop
        let graph_in = common.graph_in;
        let NeighborSet = constructNeighborSet(graph_in);
        
        let ForceDirectedWidth = width - 10;
        let ForceDirectedHeight = height - 50;
        let subgraph_index = -1;

        if(showSource){
            specificNodeIdList = [select_inspect_node];
        }
        if(extendedMode === 2){
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
        }else if(extendedMode === 3){
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
            specificNodeIdList = this.constructExtendedSelectedNodeIdList(specificNodeIdList, NeighborSet);
        }
        else if(extendedMode >= 4){
            subgraph_index = extendedMode - 4;
            if(subgraph_index >= subgraph_list.length){
                console.log("Not found the subgraph.");
                subgraph_index = -1;
            }
        }
        this.props.changeSpecificNodeIdList(specificNodeIdList);

        let graph_json:any = this.constructGraphJson(graph_object, show_mode, explained_node, 
            specificNodeIdList, this.state.enableForceDirected, 
            select_inspect_node,showSource,  ForceDirectedWidth, ForceDirectedHeight, selected_models_list, subgraph_index);

        graph_json["NeighborSet"] = NeighborSet;
        if(graph_json["success"]){
            this.prevGraphJson = graph_json;
        }
        
            
        if(graph_json["success"]){
            let nodenum: number = graph_json["nodenum"];
            let extendedOptions:any = [
                [1,"None"],
                [2,"One Hop"],
                [3,"Two Hop"]];
            if(showSource){
                let subgraphs = graph_object.subgraphs;
                let found_extendedOptions = false;
                if(extendedMode <= 3){
                    found_extendedOptions = true;
                }
                for (var subg_type_id = 0; subg_type_id < subgraph_list.length; subg_type_id++) {
                    let subgraph_name = subgraph_list[subg_type_id];
                    if(Object.keys(subgraphs[subgraph_name]["node_subgraphs"]).indexOf(""+select_inspect_node)>=0){
                        let sp_subgraphs = subgraphs[subgraph_name]["node_subgraphs"][select_inspect_node];
                        if(sp_subgraphs["nodes"].length > 0){
                            extendedOptions.push([subg_type_id + 4, subgraph_list[subg_type_id]]);
                            if(extendedMode == subg_type_id + 4){
                                found_extendedOptions = true;
                            }
                        }
                    }
                }
                if(!found_extendedOptions){
                    this.props.changeExtendedMode(3);
                }
            }
            

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
                    <GraphViewSettingsModalContainer />
                    &nbsp;&nbsp;
                    Subgraph:&nbsp;
                    <Select
                        placeholder="Select a subgraph"
                        value={extendedMode}
                        style={{ width: '100px' }}
                        onChange={this.onExtendedModeChange}
                        size="small"
                    >
                        {extendedOptions.map((d:any)=>(
                            <Option value={d[0]} key={d[0]}>
                                {d[1]}
                            </Option>
                        ))}
                        </Select>
                    &nbsp;&nbsp;
                    {(this.state.enableForceDirected)?
                        <Button type="primary" size="small" onClick={stopLayout}>Stop Layout</Button>:
                        <Button type="default" size="small" onClick={startLayout}>Start Layout</Button>}
                    &nbsp;&nbsp;
                    <Button type="default" size="small" onClick={()=>{this.showGraphViewSettingModal()}} ><SettingOutlined /></Button>
                    &nbsp;&nbsp;
                    #Nodes: <Tag>{getNodeStatisticStr(specificNodeIdList.length, nodenum)} </Tag>
                    
                    </div>
                </div>
                <div className="ViewBox">
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

