
import './DataRuns.css'
import * as React from "react";
//import MyFirstGrid from './MyFirstGrid';
import GraphViewContainer from '../../container/GraphViewContainer';
import MessagePassingViewContainer from '../../container/MessagePassingViewContainer';
import EmbeddingViewContainer from '../../container/EmbeddingViewContainer';
import FeatureMatrixContainer from '../../container/FeatureMatrixContainer';
import ControlPanelContainer from '../../container/ControlPanelContainer';
import PSViewContainer from '../../container/PSViewContainer';
import SelectedNodeListContainer from '../../container/SelectedNodeListContainer';
import { getGraphInfo, getGraphBundledInfo, getRulesInfo } from '../../service/dataService';
import { Select, Row, Col, Upload, Icon, Button, message, Tag } from 'antd';
import {getInfectionNodeColor, getInfectionEdgeColor, getLayoutMode} from '../../helper';
import {Tabs, Table} from 'antd';
import GridLayout from "react-grid-layout";
const TabPane = Tabs.TabPane
const d3 = require("d3");
const Option = Select.Option;


export interface IProps {
    model : number | null,
    graph : number | null,
    dataset_id : number | null,
    explain_id : number | null,
    modelList : any[],
    contentWidth:number,
    contentHeight:number
}
export interface IState {
    graph_object : any,
    show_mode : number,
    explained_node : number,
    layout_config: any,
    screenWidth: number,
    screenHeight: number
}

export default class DataRuns extends React.Component<IProps, IState>{
    public PCPViewRef:any;
    public GraphViewRef:any;
    public FeatureMatrixViewRef:any; 
    public ControlPanelRef: any;
    public ProjectionViewRef: any;
    constructor(props:IProps) {
        super(props);
        this.onShowModeChange = this.onShowModeChange.bind(this);
        this.onExplainNodeChange = this.onExplainNodeChange.bind(this);
        this.onResizeStop = this.onResizeStop.bind(this);
        this.getLayoutConfigWithName = this.getLayoutConfigWithName.bind(this);
        this.getCurrentLayoutConfig = this.getCurrentLayoutConfig.bind(this);
        this.onResize = this.onResize.bind(this);
        this.PCPViewRef = React.createRef();
        this.GraphViewRef = React.createRef();
        this.FeatureMatrixViewRef = React.createRef();
        this.ControlPanelRef = React.createRef();
        this.ProjectionViewRef = React.createRef();
        this.state = {
            graph_object:{
                model : -1,
                graph : -1,  
            },
            show_mode: 1,
            explained_node: 0,
            layout_config: null,
            screenWidth : 0,
            screenHeight: 0
        }
        // show_mode_specification
        // 1 -> graph_input
        // 2 -> graph_target
        // 3 -> graph_output
        // 4 -> Explain_mode
        // Explained_node, default for 0.

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
    // Mount
    componentWillMount() {
        //console.log('Component will mount!')
     }
     public onResize(){
        this.setState({
            screenHeight: window.innerHeight,
             screenWidth: window.innerWidth
        })
     }  
     componentDidMount(){
        //window.addEventListener('resize', this.onResize)
         this.setState({
             layout_config: this.getWholeLayoutConfig(),
             screenHeight: window.innerHeight,
             screenWidth: window.innerWidth
         })
     }
     
    // Update
     shouldComponentUpdate(nextProps:IProps, nextState:IState){
        
        return true;
        
    }
   
     componentWillUpdate(nextProps:IProps, nextState:IState) {
        //console.log('Component will update!');
        
     }
     public async getgraphdata(dataset_id:number, model:number, explain_id:number, graph:number){
        let data = await getGraphInfo(dataset_id,model,explain_id,graph);
        if(data["success"] === true){
            this.setState({
                graph_object: data["graph_obj"]
            })
        }

     }
     public async getGraphBundledData(dataset_id:number){
         let data = await getGraphBundledInfo(dataset_id);
         if(data["success"] === true){
            //let rules_data = await getRulesInfo(dataset_id);
            //if(rules_data["success"] === true){
            //    data["graph_obj"]["rules_data"] = rules_data["rule_obj"];
            data["graph_obj"]["bundle_id"] = dataset_id;
            this.setState({
                graph_object: data["graph_obj"]
                })
            //}
             
         }
     }
     public getLayoutConfigWithName(name:string){
         let width = 0;
         let height = 0;
         if(name === "PCPView"){
            if(this.PCPViewRef){ 
                width = this.PCPViewRef.current.offsetWidth;
                height = this.PCPViewRef.current.offsetHeight;
            }
         }else if(name === "GraphView"){
             if(this.GraphViewRef){
                 width = this.GraphViewRef.current.offsetWidth;
                 height = this.GraphViewRef.current.offsetHeight;
             }

         }else if(name === "FeatureMatrixView"){
            if(this.FeatureMatrixViewRef){
                width = this.FeatureMatrixViewRef.current.offsetWidth;
                height = this.FeatureMatrixViewRef.current.offsetHeight;
            }
         }else if(name === "ProjectionView"){
             if(this.ProjectionViewRef){
                 width = this.ProjectionViewRef.current.offsetWidth;
                 height = this.ProjectionViewRef.current.offsetHeight;
             }
         }else if(name === "ControlPanel"){
             if(this.ControlPanelRef){
                 width = this.ControlPanelRef.current.offsetWidth;
                 height = this.ControlPanelRef.current.offsetHeight;
             }
         }

         return {
             "width":width,
             "height":height
         }
     }
     public getWholeLayoutConfig(){
        let viewName = ["PCPView", "GraphView", "FeatureMatrixView","ControlPanel", "ProjectionView"];
        let layout_config:any = {};
        viewName.forEach((d:any)=>{
            layout_config[d] = this.getLayoutConfigWithName(d);
        })
        return layout_config;
     }
     public getCurrentLayoutConfig(name:string){
         let layout_config = this.state.layout_config;
        if(layout_config){
            if(layout_config[name]){
                return layout_config[name];
            }else{
                return null;
            }
        }else{
            return null;
        }
     }
     componentDidUpdate(prevProps:IProps, prevState:IState) {
        //console.log('Component did update!')
        if(getLayoutMode() === 3){
            if(prevProps.dataset_id!== this.props.dataset_id){
                if( this.props.dataset_id  && this.props.dataset_id>=0){
                    this.getGraphBundledData(this.props.dataset_id);
                    
                }else{
                    this.setState({
                        graph_object:{
                            model : -1,
                            graph : -1,  
                        }
                    })
                }
            }
            /*
            if(prevState.screenHeight!==this.state.screenHeight
                || prevState.screenWidth !== this.state.screenWidth){
                    this.setState({
                        layout_config: this.getWholeLayoutConfig()
                    })
                }*/
            if(prevProps.contentHeight!==this.props.contentHeight
                || prevProps.contentWidth !== this.props.contentWidth){
                    this.setState({
                        layout_config: this.getWholeLayoutConfig()
                    })
                }   
        }else{
            if(prevProps.graph!== this.props.graph || prevProps.model !== this.props.model
                || prevProps.dataset_id!== this.props.dataset_id || prevProps.explain_id !== this.props.explain_id ){
                if(this.props.graph && this.props.model && this.props.dataset_id && this.props.explain_id
                    && this.props.graph >= 0 && this.props.model >= 0 && this.props.dataset_id>=0 && this.props.explain_id>=0){
                    this.getgraphdata(this.props.dataset_id, this.props.model, this.props.explain_id, this.props.graph);
                    
                }else{
                    this.setState({
                        graph_object:{
                            model : -1,
                            graph : -1,  
                        }
                    })
                }
            }
        }
        
        
     }
     
    public onShowModeChange(ShowMode: number) {
        this.setState({
            show_mode:ShowMode
        })
    }
    public onExplainNodeChange(ExplainedNode: number) {
        this.setState({
            explained_node:ExplainedNode
        })
    }
    public onLayoutChange(layout:any){
        console.log("Layout", layout);
    }
    public onResizeStop(layout:any){
        console.log("onResizeStop", layout);
        console.log("Layout", this.getWholeLayoutConfig());
        this.setState({
            layout_config : this.getWholeLayoutConfig()
        })
        //var width = document.getElementById('a').offsetWidth;
    }
    public render() {
        //console.log("Render Again");
        let {graph_object, show_mode, explained_node} = this.state;
        let {modelList} = this.props;
        //console.log(graph_object)
        let model = -1;
        let graph = -1;
        let dataset_id = -1;
        if(getLayoutMode()===3){
            model = -1;
            graph = -1;
            let common = graph_object.common;
            if(common){
                dataset_id = common.dataset_id;
            }
        }else{
            model = graph_object.model;
            graph = graph_object.graph;
        }
        let generateTips = () =>{
            let tips: any = "Please select a dataset, a model, an explantion method, and a graph.";
            if(getLayoutMode() === 3){
                tips = "Please select a dataset";
            }
            return(
            <Row style={{marginTop: '6px', marginLeft: '6px'}} gutter={6}>
            <div>{tips}</div>
            </Row>
            )
        }
        
        console.log("Dataruns graph_object", graph_object);
        let generateGraphView = (graph_object: any, show_mode:number, explained_node:number, 
            onExplainNodeChange:any, onShowModeChange:any, model:number, modelList:any[], width:number, height:number) => {
            return <GraphViewContainer graph_object={graph_object} 
                show_mode={show_mode}
                explained_node={explained_node}
                onExplainNodeChange={onExplainNodeChange}
                onShowModeChange={onShowModeChange}
                model={model}
                modelList={modelList}
                width={width}
                height={height}
                />
        }
        let generateMessagePassingView = (graph_object: any, show_mode:number, 
            explained_node:number, onExplainNodeChange:any, onShowModeChange:any, 
            model:number, modelList:any[], width: number, height:number) => {
            return <MessagePassingViewContainer graph_object={graph_object} 
                show_mode={show_mode}
                explained_node={explained_node}
                onExplainNodeChange={onExplainNodeChange}
                onShowModeChange={onShowModeChange}
                model={model}
                modelList={modelList}
                width={width}
                height={height}
                />
        }
        let generateEmbeddingView = (graph_object: any, show_mode:number, explained_node:number, 
            onExplainNodeChange:any, onShowModeChange:any, model:number, modelList:any[], 
            width: number, height: number) => {
            return <EmbeddingViewContainer graph_object={graph_object} 
                show_mode={show_mode}
                explained_node={explained_node}
                onExplainNodeChange={onExplainNodeChange}
                onShowModeChange={onShowModeChange}
                model={model}
                modelList={modelList}
                width={width}
                height={height}
                />
        }
        let generateFeatureMatrixView = (graph_object: any, show_mode:number, explained_node:number, 
            onExplainNodeChange:any, onShowModeChange:any, model:number, modelList:any[], 
            width: number, height: number) => {
            return <FeatureMatrixContainer graph_object={graph_object} 
                show_mode={show_mode}
                explained_node={explained_node}
                onExplainNodeChange={onExplainNodeChange}
                onShowModeChange={onShowModeChange}
                model={model}
                modelList={modelList}
                width={width}
                height={height}
                />
        }
        let generatePCPView = (graph_object: any, show_mode:number, 
            explained_node:number, onExplainNodeChange:any, 
            onShowModeChange:any, model:number, modelList:any[], width:number=0, height:number=0) => {
            return   <PSViewContainer graph_object={graph_object} 
                show_mode={show_mode}
                explained_node={explained_node}
                onExplainNodeChange={onExplainNodeChange}
                onShowModeChange={onShowModeChange}
                model={model}
                modelList={modelList}
                width={width}
                height={height}
                />
        }
        /*let generateWholeView_backup = () =>{
            return <Tabs
                        defaultActiveKey="2"
                    >
                        <TabPane tab="Graph View" key="1">
                            
                            {generateGraphView(graph_object, show_mode, explained_node, 
                                this.onExplainNodeChange, this.onShowModeChange, model, modelList)}
                        </TabPane>
                        <TabPane tab="Message Passing View" key="2">
                            {generateMessagePassingView(graph_object, show_mode, explained_node, 
                                this.onExplainNodeChange, this.onShowModeChange, model, modelList)} 
                            
                        </TabPane>
                        
                    </Tabs>
        }*/
        // layout is an array of objects, see the demo for more complete usage
        let enableStatic = true;
        let screenheight = window.innerHeight;
        let max_row_num = Math.floor(this.props.contentHeight / 40);
        // small width, height: 1707 724
        // big width, height: 2560 1175
        let ControlPanelH = 3;
        let PSPanelH = max_row_num - ControlPanelH;
        let ProjectionPanelH = Math.floor(max_row_num / 2);
        let RH = max_row_num - ProjectionPanelH;
        // 9 - 9
        // 12 - 17
        let layout = [
            {i: 'a', x: 0, y: ControlPanelH, w: 6, h: PSPanelH, static:enableStatic}, // PS View
            {i: 'b', x: 6, y: ProjectionPanelH, w: 11, h: RH, static:enableStatic}, // Graph View
            {i: 'c', x: 17, y: ProjectionPanelH, w: 7, h: RH, static:enableStatic}, // Feature Matrix View
            {i: 'd', x: 0, y: 0, w: 6, h: ControlPanelH, static:enableStatic},  // Control Panel
            {i: 'e', x: 6, y: 0, w: 18, h: ProjectionPanelH, static:enableStatic}  // Projection View
        ];
        


        let generateWholeView = () =>{
            let layout_mode:any = getLayoutMode();
            let screenwidth = window.innerWidth;
            let screenheight = window.innerHeight;
            let viewwidth = screenwidth * 1/3;
            let viewheight = screenheight* 0.45;
            if(layout_mode === 1){
                // Layout Style 1
                return (
                    <Row style={{marginTop: '0px', marginLeft: '6px'}} gutter={6}>
                        <Row gutter={6}>
                            <Col span={4}>
                                <div style={{width: "100%", overflowX: "scroll", height:""+(screenheight- 50)+"px"}}>
                                 {generatePCPView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList)} 
                                </div>
                            </Col>
                            <Col span={14}>
                                    {generateGraphView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                                     viewwidth * 3 * 14 / 24, viewheight / 0.45 * 0.7)}
                            </Col>
                            <Col span={6}>
                                <Row>
                                    {generateMessagePassingView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                                        viewwidth * 3 * 6 / 24, viewheight / 0.45 * 0.25)} 
                                </Row>
                                <Row>
                                    {generateEmbeddingView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList,
                                    viewwidth* 3 * 6 / 24, viewheight/ 0.45 * 0.25)} 
                                </Row>
                            </Col>

                        </Row>
                        <Row>
                                {generateFeatureMatrixView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList,
                                    viewwidth* 3 , viewheight / 0.45)} 
                        </Row>
                    </Row>)
            }else if(layout_mode===2){
                return (<Row style={{marginTop: '0px', marginLeft: '6px'}} gutter={6}>
                        <Row>
                            <Col span={24}>
                                <div style={{width: "100%", height:""+(screenheight*0.31)+"px"}}>
                            {generatePCPView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList)} 
                            </div>
                            </Col>
                        </Row>
                        <Row gutter={6}>
                            <Col span={16}>
                            
                            {generateGraphView(graph_object, show_mode, explained_node, 
                            this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                        viewwidth * 3 * 16 / 24, viewheight )}
                            </Col>
                            <Col span={8}>
                            {generateMessagePassingView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                                    viewwidth * 3 * 8 / 24, viewheight)} 
                            </Col>
                        </Row>
                        <Row>
                            {generateFeatureMatrixView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList,
                                viewwidth* 3 , viewheight / 0.45)} 
                        </Row>
                    </Row>
                )
            }else if(layout_mode === 3){
                /*
                return (<Row style={{marginTop: '0px', marginLeft: '6px'}} gutter={6}>
                        <Row gutter={6}>
                            <Col span={6}>
                                <div style={{width: "100%", height:""+(screenheight - 50)+"px", overflowX: "scroll"}}>
                                    
                                 {(dataset_id>=0)?generatePCPView(graph_object, show_mode, explained_node, 
                                        this.onExplainNodeChange, this.onShowModeChange, model, modelList):
                                        <div>
                                                <div className="ViewTitle">Control Panel</div>
                                                <div className="ViewBox">
                                                        <SidePanelContainer />
                                                </div>
                                        </div>}
                                </div>
                            </Col>
                            <Col span={18}>
                            
                                    {(dataset_id>=0)?generateGraphView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                                viewwidth * 3 * 18 / 24, viewheight/0.45*0.90 ):<div />}
                            </Col>
                            
                        </Row>
                        <Row>
                            {(dataset_id>=0)?generateFeatureMatrixView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList,
                                viewwidth* 3 , viewheight / 0.45):<div />} 
                        </Row>
                    </Row>
                )*/
                return <GridLayout className="layout" layout={layout} 
                cols={24} rowHeight={30} width={screenwidth} onLayoutChange={this.onLayoutChange}
                onResizeStop={this.onResizeStop}>
                    <div className="PanelBox" key="a" ref={this.PCPViewRef}>
                        
                                    
                            {(dataset_id>=0 && this.getCurrentLayoutConfig("PCPView"))?
                            generatePCPView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList
                                    ,this.getCurrentLayoutConfig("PCPView")["width"], this.getCurrentLayoutConfig("PCPView")["height"]):
                                    <div />}
                            

                    </div>
                    <div className="PanelBox" key="b" ref={this.GraphViewRef}>
                    {(dataset_id>=0 && this.getCurrentLayoutConfig("GraphView"))?generateGraphView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList, 
                                    this.getCurrentLayoutConfig("GraphView")["width"], this.getCurrentLayoutConfig("GraphView")["height"]):<div />}
                    </div>
                    <div className="PanelBox" key="c" ref={this.FeatureMatrixViewRef}>
                    {(dataset_id>=0 && this.getCurrentLayoutConfig("FeatureMatrixView"))?generateFeatureMatrixView(graph_object, show_mode, explained_node, 
                                    this.onExplainNodeChange, this.onShowModeChange, model, modelList,
                                    this.getCurrentLayoutConfig("FeatureMatrixView")["width"], this.getCurrentLayoutConfig("FeatureMatrixView")["height"]):<div />} 
                    </div>
                    <div className="PanelBox" key="d" ref={this.ControlPanelRef}>
                        <ControlPanelContainer />
                    </div>
                    <div className="PanelBox" key="e" ref={this.ProjectionViewRef}>
                    {(dataset_id>=0 && this.getCurrentLayoutConfig("ProjectionView"))?(
                    <SelectedNodeListContainer height={this.getCurrentLayoutConfig("ProjectionView")["height"]} width={this.getCurrentLayoutConfig("ProjectionView")["width"]}/>)
                    :(<div />)}

                    </div>
                </GridLayout>
            }else{
                return <div>Unknown Layout Style</div>
            }
        }
        if(getLayoutMode() === 3){

        }
        if(getLayoutMode() === 3){
            return (
                    generateWholeView()
                    
            )
        }else{
            return (
                (graph>=0 && model >=0)?(
                    generateWholeView())
                    :
                    (generateTips()
                    )
            )
        }
        

    }
}

