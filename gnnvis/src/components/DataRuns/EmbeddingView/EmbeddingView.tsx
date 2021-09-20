
import * as React from "react";
import ScatterPlot from "./ScatterPlot";
//import PathGraph from "./PathGraph";
//import RadialTree from "./RadialTree";
import { Select, Row, Col, Upload, Icon, Button, message, Tag, Checkbox } from 'antd';
import {getCoraNodeColor, getInfectionEdgeColor, getCoraTextColor} from '../../../helper';
//import { changeShowSource } from "../../../actions";
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
    width:number,
    height:number,
    specificNodeIdList: any[]
    //changeMessagePassingNodeIdList:any,
    //changeShowSource:any,
    //showSource:boolean
}
export interface IState {
    select_node : number,
    color_encode: number,
    embeddinglayer : number
}

export default class EmbeddingView extends React.Component<IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.onSelectNodeChange = this.onSelectNodeChange.bind(this);
        this.onColorEncodeChange = this.onColorEncodeChange.bind(this);
        this.onEmbeddingLayerChange = this.onEmbeddingLayerChange.bind(this);
        //this.onShowSourceChange = this.onShowSourceChange.bind(this);
        this.state = {
            select_node : 0,
            color_encode : 2,
            embeddinglayer: 1
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
     public onSelectNodeChange(select_node: number) {
        this.setState({
            select_node:select_node
        })
    }
    public onColorEncodeChange(color_encode: number) {
        this.setState({
            color_encode:color_encode
        })
    }
    public onEmbeddingLayerChange(embeddinglayer: number) {
        console.log("onembeddinglayerchange")
        this.setState({
            embeddinglayer:embeddinglayer
        })
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



     public constructScatterPlotJson(graph_object:any,show_layer:string="input",width=600,height=600,margin=100,
     exceedingmargin=20,color_encode:number=2, selectedNodeIdList:any[]=[]){
        let selectedStr = selectedNodeIdList.join("_");

        let graph_name = graph_object.name+"_"+graph_object.dataset_id+"_"+(graph_object.model)
                +"_"+graph_object.explain_id 
                +"_"+(graph_object.graph)+"_"+graph_object.data_type_id+"_"+color_encode+"_"+width+"_"+height+"_SELECTED_"+selectedStr+"_SELECTED_END_";
        
        let graph_in = graph_object.graph_in;
        let graph_target = graph_object.graph_target;
        let graph_out = graph_object.graph_out;
        let graph_explaination = graph_object.graph_explaination;
        let explaination_type = graph_explaination.type;
        if(explaination_type !== "MessagePassing"){
            console.log("Unsupported explaination type , ", explaination_type);
            return {"success": false};
        }
        if(selectedNodeIdList.length === 0){
            return {"success":false};

        }
        let embedding = graph_object.embedding;
        let show_embedding = embedding[show_layer];
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
        function transform_graphlayout(graph_layout:any[],width=600,height=600,margin=100,exceedingmargin=20){
            if(graph_layout.length === 0){
                return graph_layout;
            }else{
                let bounding_box = get_boundingbox(graph_layout);
                
                if(graph_layout.length >= 100){
                    margin = exceedingmargin;
                }
                
                let realwidth = width - 2*margin;
                let realheight = height - 2*margin;
                let gap_x = bounding_box["xmax"] - bounding_box["xmin"];
                let gap_y = bounding_box["ymax"] - bounding_box["ymin"];
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
        
        let data_type = graph_object.data_type_id;
        let task = graph_object.task;
        function transform_node_feature(value:number, max:number, min:number){
            return (value - min) / (max-min+1e-16);
        }
        show_embedding = transform_graphlayout(show_embedding,width,height,margin,exceedingmargin);
        if(data_type == 2){
           
            
            let node_num = graph_target.node_features.length;
            //let edge_num = graph_in.senders.length;
            let nodes_json = [];
            //var color_func = d3.scaleOrdinal(d3.schemeCategory10);
            for(let i = 0; i<node_num;i++){
                let label = graph_target.node_features[i];
                if(color_encode === 2){
                    label = graph_target.node_features[i];
                }else if(color_encode === 3){
                    label = graph_out.node_features[i];
                }else if(color_encode === 5){
                    label = graph_target.node_features[i] === graph_out.node_features[i];
                }
                let color = getCoraNodeColor(label, color_encode);
                if(selectedNodeIdList.indexOf(i)>=0){
                    
                }else{
                    color = "#ddd";
                }
                let node_object:any = {
                    "id":i,
                    "group":label,
                    "color":color,
                    "x":show_embedding[i][0],
                    "y":show_embedding[i][1]
                }
                nodes_json.push(node_object);
            }
            
            let graph_json = {
                "success":true,
                "name":graph_name,
                "nodes":nodes_json,
                "nodenum":node_num,
            }
            return graph_json;
        }else{
            console.log("Unknown data type : ", data_type )
            return {"success":false}; 
        }


        
    }
    
    public render() {
        let {graph_object, model, modelList, width, height, specificNodeIdList} = this.props;
        let box_margin = 30;

        let box_height = height ;
        let box_width = width;
        let svgheight = ""+height+"px";
        let accuracy_package = this.getMisclassified(graph_object);
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
        let select_node = this.state.select_node;
        //console.log("Select Node:", select_node);
        //console.log("Select node target/output:", graph_target.node_features[select_node], graph_out.node_features[select_node]);
        if(explanation_type == "MessagePassing"){
            
            //let PathGraph_json:any = this.constructPathGraphJson(graph_object,this.state.select_node,this.state.color_encode);
            //let RadialTree_json:any = this.constructRadialTreeJson(graph_object,this.state.select_node,this.state.color_encode);
            //this.notifyMessagePassingNodeIdList(RadialTree_json);
            //let start_x = (width-box_width)/2;
            //let start_y = 50;
            let start_x = 0;
            let start_y = 0;
            let nodenum = graph_object.graph_target.node_features.length;
            let colorOptions = [
                [2, "Ground Truth"],
                [3, "Model Output"],
                [5, "True / False"]
            ]
            let embeddingOptions = [
                [1, "Input Layer"],
                [2, "Hidden Layer"],
                [3, "Output Layer"]
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
            let generateEmbeddingLayerSelect = (options:any[], embeddinglayer:number, onEmbeddingLayerChange:any) =>{
                return (<Select
                        placeholder="Select a embedding layer"
                        value={embeddinglayer}
                        style={{ width: '200px' }}
                        onChange={onEmbeddingLayerChange}
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
            let generateEmbeddingView = (embeddinglayer:number)=>{
                console.log("embeddinglayer", embeddinglayer);
                let title = ["", "input", "hidden", "output"];
                box_width = box_width * 2;
                box_height = box_height * 2;
                let scatter_plot_json = this.constructScatterPlotJson(graph_object,title[embeddinglayer],box_width,box_height,box_margin,box_margin,this.state.color_encode, specificNodeIdList);
                //width = width * 10;
                //height = height * 10;
                if(scatter_plot_json["success"]){
                    if(embeddinglayer === 1){

                        return <ScatterPlot x={0} y={0} width={width} height={height}
                        graph_json={scatter_plot_json} id={1} caption={"Input Layer"}> </ScatterPlot>
                    }else if(embeddinglayer === 2){
    
                        return <ScatterPlot x={0} y={0} width={width} height={height} 
                        graph_json={scatter_plot_json} id={2} caption={"Hidden Layer"}> </ScatterPlot>
                    }else if(embeddinglayer === 3){
    
                        return <ScatterPlot x={0} y={0} width={width} height={height}
                    graph_json={scatter_plot_json} id={3} caption={"Output Layer"}> </ScatterPlot>
                    }else{
                        return <div />
                    }
                }else{
                    return <div />
                }
                
            }
            return (            
            <div>
                <div className="ViewTitle">Embedding View</div>
                <div className="ViewBox">
                    Select Embedding Layer:
                    {generateEmbeddingLayerSelect(embeddingOptions,this.state.embeddinglayer,this.onEmbeddingLayerChange)}
                    Select Color Encode:
                    {generateColorSelect(colorOptions, this.state.color_encode, this.onColorEncodeChange)}
                    <div
                    style={{
                        height: svgheight,
                        width: '100%',
                        borderTop: ".6px solid rgba(0,0,0, 0.4)"
                        }}
                    >
                        
                            {generateEmbeddingView(this.state.embeddinglayer)}
                            
                        
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

