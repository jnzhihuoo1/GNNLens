
import * as React from "react";
import ScatterPlot from "./ScatterPlot";
import PathGraph from "./PathGraph";
import RadialTree from "./RadialTree";
import { Select, Row, Col, Upload, Icon, Button, message, Tag, Checkbox } from 'antd';
import {getCoraNodeColor, getInfectionEdgeColor, getCoraTextColor, getLayoutMode, constructPathDict} from '../../../helper';
import { changeShowSource } from "../../../actions";
const Option = Select.Option;
const d3 = require("d3");

export interface IProps {
    graph_object:any,
    show_mode:number, 
    explained_node:number, 
    onExplainNodeChange:any, 
    onShowModeChange:any,
    model:number,
    modelList:any[],
    changeMessagePassingNodeIdList:any,
    changeShowSource:any,
    showSource:boolean,
    width:number,
    height:number,
    select_inspect_node:number,
    changeSelectInspectNode:any
}
export interface IState {
    color_encode: number
}

export default class MessagePassingView extends React.Component<IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.onSelectNodeChange = this.onSelectNodeChange.bind(this);
        this.onColorEncodeChange = this.onColorEncodeChange.bind(this);
        this.onShowSourceChange = this.onShowSourceChange.bind(this);
        this.state = {
            color_encode : 2
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
     public onSelectNodeChange(select_inspect_node: number) {
        this.props.changeSelectInspectNode(select_inspect_node);
        //this.setState({
        //    select_node:select_node
        //})
    }
    public onColorEncodeChange(color_encode: number) {
        this.setState({
            color_encode:color_encode
        })
    }
    public constructRadialTreeJson(graph_object:any,select_node:number=0,color_encode:number=2,level:number=2,width=600,height=600,margin=100,exceedingmargin=20){
        let graph_name = graph_object.name+"_"+graph_object.dataset_id+"_"+(graph_object.model)
                +"_"+graph_object.explain_id 
                +"_"+(graph_object.graph)+"_"+graph_object.data_type_id+"_"+select_node+"_"+color_encode;
        
        let graph_in = graph_object.graph_in;
        let graph_target = graph_object.graph_target;
        let graph_out = graph_object.graph_out;
        let graph_explaination = graph_object.graph_explaination;
        let explaination_type = graph_explaination.type;
        let mask = graph_object.mask;
        let train_mask = mask.train;

        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        let node_num = graph_target.node_features.length;
        if(!(select_node >= 0 && select_node < node_num)){
            console.log("Out of the range,  select_node , ", select_node);
            return {"success": false};
        }
        //let embedding = graph_object.embedding;
        //let show_embedding = embedding[show_layer];
        
        let message_passing = graph_object.message_passing;
        
        let PathDict = constructPathDict(message_passing);
        
        //console.log("Radial Data PathDict", PathDict)
        function getColor(node_id:number){
            let label = graph_target.node_features[node_id];
            if(color_encode === 2){
                label = graph_target.node_features[node_id];
            }else if(color_encode === 3){
                label = graph_out.node_features[node_id];
            }else if(color_encode === 5){
                label = graph_target.node_features[node_id]===graph_out.node_features[node_id];
                
            }
            return getCoraNodeColor(label, color_encode);
        }
        function getTextColor(node_id:number){
            let isTrain = train_mask.indexOf(node_id);
            if(isTrain>=0){
                // Train Node
                return getCoraTextColor(0);
            }else{
                return getCoraTextColor(1);
            }
        }
        function transform_node_feature(value:number, max:number, min:number){
            return (value - min) / (max-min+1e-16);
        }
        
        function constructRadialLevel(PathDict:any, select_node:number, level:number){
            let RadialData:any[] = []; // id, data_id, level, value, color
            let valuelist : any[] = [];
            
            RadialData.push(
                {
                    "id":""+select_node,
                    "data_id":select_node,
                    "level":0,
                    "value":0,
                    "color":getColor(select_node),
                    "text_color":getTextColor(select_node)
                }
                );
            for(let i = 0; i<RadialData.length; i++)
            {
                let nownode_entry = RadialData[i];
                let nownode_level = nownode_entry.level;
                if(nownode_level>=level){
                    break;
                }
                let nownode = nownode_entry.data_id;
                let succnodes = Object.keys(PathDict[nownode]);
                for(let k = 0; k< succnodes.length; k ++ ){
                    let succnode = parseInt(succnodes[k]);
                    let value = PathDict[nownode][succnode];
                    valuelist.push(value);
                    RadialData.push(
                        {
                            "id":""+nownode_entry.id+"."+succnode,
                            "data_id":succnode,
                            "level":nownode_level+1,
                            "value":value,
                            "color":getColor(succnode),
                            "text_color":getTextColor(succnode)
                        });
                    }
            }
            let valuemin = Math.min(...valuelist);
            let valuemax = Math.max(...valuelist);
            for(let i = 0; i < RadialData.length; i++){
                if(RadialData[i].level>=1){
                    let feature = RadialData[i].value;
                    feature = transform_node_feature(feature, valuemax, valuemin);
                    RadialData[i].link_color = getInfectionEdgeColor(4, feature, 1);
                }else{
                    RadialData[i].link_color = "#999999";
                }
            }
            //console.log(RadialData);
            return RadialData;
        }
        
        let data_type = graph_object.data_type_id;
        let task = graph_object.task;
        let RadialData = constructRadialLevel(PathDict, select_node, level);
        if(data_type === 2){
            let graph_json = {
                "success":true,
                "name":graph_name,
                "RadialData":RadialData,
                "nodenum":RadialData.length
            }
           
            return graph_json;
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }
        
    }



     public constructPathGraphJson(graph_object:any,select_node:number=0,color_encode:number=2,level:number=2,width=600,height=600,margin=100,exceedingmargin=20){
        let graph_name = graph_object.name+"_"+graph_object.dataset_id+"_"+(graph_object.model)
                +"_"+graph_object.explain_id 
                +"_"+(graph_object.graph)+"_"+graph_object.data_type_id+"_"+select_node+"_"+color_encode;
        
        let graph_in = graph_object.graph_in;
        let graph_target = graph_object.graph_target;
        let graph_out = graph_object.graph_out;
        let graph_explaination = graph_object.graph_explaination;
        let explaination_type = graph_explaination.type;
        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        let node_num = graph_target.node_features.length;
        if(!(select_node >= 0 && select_node < node_num)){
            console.log("Out of the range,  select_node , ", select_node);
            return {"success": false};
        }
        //let embedding = graph_object.embedding;
        //let show_embedding = embedding[show_layer];
        
        let message_passing = graph_object.message_passing;
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
        let PathDict = constructPathDict(message_passing);
        
        function constructPathLevel(PathDict:any, select_node:number, level:number){
            let PathLevel = [];
            let sourcelist = [];
            let targetlist = [];
            let valuelist = [];
            // Level 0
            let nodeid_idx = 0;
            let nodeid_dict:any = {};
            function getNodeIdx(node_id:string){
                if(node_id in nodeid_dict){
                    return nodeid_dict[node_id];
                }else{
                    nodeid_dict[node_id] = nodeid_idx;
                    nodeid_idx = nodeid_idx + 1;
                    return nodeid_dict[node_id];
                }
            }
            PathLevel.push([select_node]);
            getNodeIdx(""+select_node+"_0");
            for(let i = 0; i<level; i++){
                let existingLevel = PathLevel[i];
                let nowlevel = i+1;
                let newPathLevel:any[] = [];
                for(let j = 0; j < existingLevel.length; j++){
                    let nownode = existingLevel[j];
                    let nownode_idx = getNodeIdx(""+nownode+"_"+i);
                    let succnodes = Object.keys(PathDict[nownode]);
                    for(let k = 0; k< succnodes.length; k ++ ){
                        let succnode = parseInt(succnodes[k]);
                        let succnode_idx ;
                        if(newPathLevel.indexOf(succnode)>=0){
                            succnode_idx = getNodeIdx(""+succnode+"_"+nowlevel);
                        }else{
                            newPathLevel.push(succnode);
                            succnode_idx = getNodeIdx(""+succnode+"_"+nowlevel);
                        }
                        sourcelist.push(succnode_idx);
                        targetlist.push(nownode_idx);
                        valuelist.push(PathDict[nownode][succnode]);
                    }
                }
                PathLevel.push(newPathLevel);
            }
            let return_package = {
                "PathLevel" : PathLevel,
                "sourcelist" : sourcelist,
                "targetlist" : targetlist,
                "valuelist" : valuelist,
                "nodeid_dict" : nodeid_dict
            }
            return return_package;
        }
        
        let data_type = graph_object.data_type_id;
        let task = graph_object.task;
        let return_package = constructPathLevel(PathDict, select_node, level);
        function transform_node_feature(value:number, max:number, min:number){
            return (value - min) / (max-min+1e-16);
        }
        if(data_type == 2){
           
            let PathLevel = return_package["PathLevel"];
            let sourcelist = return_package["sourcelist"];
            let targetlist = return_package["targetlist"];
            let valuelist = return_package["valuelist"];
            let valuemin = Math.min(...valuelist);
            let valuemax = Math.max(...valuelist);
            let nodeid_dict = return_package["nodeid_dict"];
            //console.log(return_package);

            //let node_num = graph_target.node_features.length;
            
            let edge_num = sourcelist.length;
            let nodes_json = [];
            let links_json = [];
            //var color_func = d3.scaleOrdinal(d3.schemeCategory10);
            let links_color_json:any[] = [];
            for(let i = 0; i < PathLevel.length; i ++){
                let thisPathLevel = PathLevel[i];
                let x = 700-(i*300+20);
                let totalnum = thisPathLevel.length + 2;
                let height = 300;
                let y_gap = height / totalnum;
                let y_start = 0 + y_gap;
                for(let j = 0; j<thisPathLevel.length;j++){
                    let y = y_start + y_gap* j;
                    let nownodeid = thisPathLevel[j];
                    let nownode_idx = nodeid_dict[""+nownodeid+"_"+i];
                    let label = graph_target.node_features[nownodeid];
                    if(color_encode === 2){
                        label = graph_target.node_features[nownodeid];
                    }else if(color_encode === 3){
                        label = graph_out.node_features[nownodeid];
                    }
                    //let color = "#999";
                    let node_object:any = {
                        "id":nownode_idx,
                        "data_id":nownodeid,
                        "group":label,
                        "color":getCoraNodeColor(label),
                        "x":x,
                        "y":y
                    }
                    nodes_json.push(node_object);
                }
            }
            
            for(let i = 0; i<edge_num;i++){
                let link_color = "#999";
                
                let feature = valuelist[i];
                feature = transform_node_feature(feature, valuemax, valuemin);
                link_color = getInfectionEdgeColor(4, feature, 1);
                
                if(links_color_json.indexOf(link_color)>=0){
                    
                }else{
                    links_color_json.push(link_color);
                }




                links_json.push({
                    "source": sourcelist[i],
                    "target": targetlist[i],
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
                "nodenum":nodes_json.length,
                "edgenum":edge_num,
            }
           
            return graph_json;
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }


        
    }
    public getAccuracy(mask:any[], ground_truth:any[], output:any[]){
        let error:number = 0;
        for(let i = 0; i< mask.length; i++){
            let ground_truth_n = ground_truth[mask[i]];
            let model_output = output[mask[i]];
            if(ground_truth_n !== model_output){
                error = error +1;
            }
        }
        return 1 - error / mask.length;
    }
    public getMisclassified(graph_object:any){
        let Misclassified = [];
        let graph_target = graph_object.graph_target;
        let graph_out = graph_object.graph_out; 
        let node_num = graph_target.node_features.length;
        for(let i = 0; i< node_num; i++){
            let ground_truth = graph_target.node_features[i];
            let model_output = graph_out.node_features[i];
            if(ground_truth !== model_output){
                Misclassified.push([i,ground_truth, model_output]);
            }
        }
        let overall_accuracy = 1- Misclassified.length / node_num;
        let mask = graph_object.mask;

        let gt = graph_target.node_features;
        let ot = graph_out.node_features;
        let train_accuracy = this.getAccuracy(mask.train, gt, ot);
        let test_accuracy = this.getAccuracy(mask.test, gt, ot);
        let valid_accuracy = this.getAccuracy(mask.valid, gt, ot);
        return {
            "overall_accuracy":overall_accuracy,
            "train_accuracy":train_accuracy,
            "test_accuracy":test_accuracy,
            "valid_accuracy":valid_accuracy,
            "Misclassified": Misclassified
        };
    }


    public notifyMessagePassingNodeIdList(RadialTree_json:any){
        if(RadialTree_json["success"]){
            let RadialData = RadialTree_json["RadialData"];
            let selectedMessagePassingNodeIdList = RadialData.map((d:any)=>{
                return d.data_id;
            })
            selectedMessagePassingNodeIdList = Array.from(new Set(selectedMessagePassingNodeIdList));
            //console.log("notify MP NodeIdList", selectedMessagePassingNodeIdList)
            this.props.changeMessagePassingNodeIdList(selectedMessagePassingNodeIdList);
        }else{
            // notify []
            //console.log("notify MP NodeIdList", [])
            this.props.changeMessagePassingNodeIdList([]);
        }
    }
    public onShowSourceChange(e:any){
        this.props.changeShowSource(e.target.checked);
    }
    public render() {
        let {graph_object, model, modelList} = this.props;


        let box_height = 250;
        let box_width = 250;
        let box_margin = 20;
        //console.log("MessagePassingView", graph_object);
        let accuracy_package = this.getMisclassified(graph_object);
        //console.log("MisClassified: ",accuracy_package);
        function find_model_name(model:number | null){
            if(model){
                for(let i = 0; i < modelList.length; i++){
                    if(modelList[i].id === model){
                        return modelList[i].name;
                    }
                }
            }
            return "";
        }
        let explanation_type = graph_object.graph_explaination.type;
        let graph_target = graph_object.graph_target;
        let graph_out = graph_object.graph_out;
        let select_node = this.props.select_inspect_node;
        //console.log("Select Node:", select_node);
        //console.log("Select node target/output:", graph_target.node_features[select_node], graph_out.node_features[select_node]);
        if(explanation_type == "MessagePassing"){
            
            let RadialTree_json:any = this.constructRadialTreeJson(graph_object,select_node,this.state.color_encode);
            this.notifyMessagePassingNodeIdList(RadialTree_json);
            let {width, height} = this.props;
            let margin = 20;
            let svgwidth = ""+width+"px";
            let svgheight = ""+height+"px";
            //let start_x = 20;
            //let start_y = 350;
            let pathgraph_start_x = margin;
            let pathgraph_start_y = margin;
            let pathgraph_width = width - margin;
            let pathgraph_height = height - margin;
            let nodenum = graph_object.graph_target.node_features.length;
            let colorOptions = [
                [2, "Ground Truth"],
                [3, "Model Output"],
                [5, "True / False"]
            ]
            let generateColorSelect = (options:any[], color_encode:number, onColorEncodeChange:any) =>{
                return (<Select
                        placeholder="Select a color"
                        value={color_encode}
                        style={{ width: '200px' }}
                        onChange={onColorEncodeChange}
                    >
                        { options.map((value:any)=>(
                                <Option key={value[0]} value={value[0]}>{value[1]}</Option>
                        ))}
                        
                    </Select>);
            }
            
            let generateSelect = (nodenum:number, select_node:number, onSelectNodeChange:any) =>{
                let arr = [];
                for(let i = 0; i<nodenum; i++){
                    arr.push(i);
                }
                return (<Select
                        showSearch
                        placeholder="Select a node"
                        value={select_node}
                        style={{ width: '100px' }}
                        onChange={onSelectNodeChange}
                    >
                        { arr.map((value:number)=>(
                                <Option key={value} value={value}>{value}</Option>
                        ))}
                        
                    </Select>);
            }
            let generateTagColor = () =>{

                let tag = [0,1,2,3,4,5,6].map((d:any)=>{
                    return <Tag key={d} color={getCoraNodeColor(d,2)}>{d}</Tag>
                })
                return tag;
            }
            let layout_mode : any = getLayoutMode();
            return (            
            <div>
                <div className="ViewTitle">Message Passing View</div>
                <div className="ViewBox">
                    {/*Model name: <Tag>{find_model_name(model)}</Tag>   
                    Graph name: <Tag>{graph_object.name}</Tag>  */}
                    Select Node: {generateSelect(nodenum,select_node,this.onSelectNodeChange)}
                    Color Encode: {generateColorSelect(colorOptions, this.state.color_encode, this.onColorEncodeChange)}
                    {/*(this.state.color_encode===2||this.state.color_encode===3)?(generateTagColor()):""*/}
                    {(this.state.color_encode===5)? (<Tag color={getCoraNodeColor(1,5)}>True</Tag>):""}
                    {(this.state.color_encode===5)? (<Tag color={getCoraNodeColor(0,5)}>False</Tag>):""}
                    Text Encode: <Tag color={getCoraTextColor(0)}>Train</Tag>   <Tag color={getCoraTextColor(1)}>Others</Tag>   
                    <Checkbox checked={this.props.showSource} onChange={this.onShowSourceChange}>Show Select Node in Graph View</Checkbox>
                    {/*<div>
                        Overall Accuracy: <Tag>{accuracy_package["overall_accuracy"].toFixed(4)}</Tag>
                        Train Accuracy: <Tag>{accuracy_package["train_accuracy"].toFixed(4)}</Tag>
                        Valid Accuracy: <Tag>{accuracy_package["valid_accuracy"].toFixed(4)}</Tag>
                        Test Accuracy: <Tag>{accuracy_package["test_accuracy"].toFixed(4)}</Tag>
                    </div>*/}
                    <div
                    style={{
                        height: svgheight,
                        width: svgwidth,
                        borderTop: ".6px solid rgba(0,0,0, 0.4)"
                        }}
                    >
                        <svg
                        style={{ height: '100%', width: '100%' }}
                        id={"TopSVGChart"}
                        xmlns="http://www.w3.org/2000/svg"
                        >
                            {(layout_mode === 1?(<RadialTree x={pathgraph_start_x - pathgraph_width / 2} y={pathgraph_start_y - pathgraph_height /2 } width={pathgraph_width * 2} height={pathgraph_height * 2}
                                graph_json={RadialTree_json} id={1} > </RadialTree>):
                                (<RadialTree x={pathgraph_start_x} y={pathgraph_start_y} width={pathgraph_width} height={pathgraph_height}
                                    graph_json={RadialTree_json} id={1} > </RadialTree>))}
                            {/*<PathGraph x={pathgraph_start_x} y={pathgraph_start_y} width={pathgraph_width} height={pathgraph_height}
                                graph_json={PathGraph_json} id={1} > </PathGraph>*/}
                            {/*<ScatterPlot x={start_x} y={start_y} width={box_width} height={box_height}
                                graph_json={scatter_plot_input_json} id={1} caption={"Input Layer"}> </ScatterPlot>
                            <ScatterPlot x={start_x+(box_width+20)*1} y={start_y} width={box_width} height={box_height}
                                graph_json={scatter_plot_hidden_json} id={2} caption={"Hidden Layer"}> </ScatterPlot>
                            <ScatterPlot x={start_x+(box_width+20)*2} y={start_y} width={box_width} height={box_height}
                    graph_json={scatter_plot_output_json} id={3} caption={"Output Layer"}> </ScatterPlot>*/}
                        </svg>
                    </div>
                </div>
            </div>)
        }else{
                return <div>Please choose message passing explanation method.</div>
        }
        //return <div>Message Passing View</div>
    //}
    }
}

