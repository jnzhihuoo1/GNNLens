import * as React from 'react';
import "./SelectedNodeList.css";
import { Tag,  Switch, Button, Select} from 'antd';
import {getLayoutMode, compareSelectedNodeIdList, getNodeStatisticStr, constructNeighborSet, getCoraNodeColor, getTrainColor} from '../../../helper';
import ProjectionView from './ProjectionView';
import { cluster, line } from 'd3';
import ProjectionViewNodeStatisticContainer from '../../../container/ProjectionViewNodeStatisticContainer';
import ProjectionViewComputing from './ProjectionViewComputing';
const Option = Select.Option;

export interface SelectedNodeListProps {
    refreshnumber:number,
    filters:any,
    PCPJson:any,
    changeSelectedNodeIdList: any,
    width:number,
    height: number,
    showSource:boolean,
    changeShowSource:any,
    changePSSelectedNodes:any,
    changeProjectionViewSelectedNodes:any,
    changeProjectionViewTotalNodeNum:any
}

export interface SelectedNodeListState {
    currentPage:number,
    enableLegends:boolean,
    enableLines:boolean,
    aggregationMode:number,
    layoutMode:number

}

export default class SelectedNodeList extends React.Component<SelectedNodeListProps, SelectedNodeListState> {
    public prevSelectedNodeIdList:any[] = [];
    public thisSelectedNodeIdList:any[] = [];
    public InsProjectionViewComputing:any = new ProjectionViewComputing();
    constructor(props: SelectedNodeListProps) {
        super(props);
        this.onChangeHighLightNodeIdList = this.onChangeHighLightNodeIdList.bind(this);
        this.onChangeHoveredNodeIdList = this.onChangeHoveredNodeIdList.bind(this);
        this.renderLines = this.renderLines.bind(this);
        this.onChangeLines = this.onChangeLines.bind(this);
        this.onChangeLegends = this.onChangeLegends.bind(this);
        this.updateSingleHighlightNodeStatus = this.updateSingleHighlightNodeStatus.bind(this);
        this.onLayoutModeChange = this.onLayoutModeChange.bind(this);
        this.state = {
            currentPage: 1,
            enableLegends : true,
            //highlightNodeIdList: [],
            enableLines : true,
            aggregationMode: 1, // 1-->Aggregation by clustering, 2--> Do not aggregation. 
            layoutMode: 1 // 1--> tSNE,  2--> UMAP
        };
    }
    componentDidMount(){
        
    }
    componentDidUpdate(prevProps:SelectedNodeListProps, prevState:SelectedNodeListState){
        if(!compareSelectedNodeIdList(this.prevSelectedNodeIdList,this.thisSelectedNodeIdList)){
            // If selected node id list is updated, then propage the selected node id list. 
            this.props.changeSelectedNodeIdList(this.thisSelectedNodeIdList)
            this.prevSelectedNodeIdList = this.thisSelectedNodeIdList.slice();
            this.InsProjectionViewComputing.updateHighlightNodeIdList([]);
            this.InsProjectionViewComputing.updateHoveredNodeIdList([]);
            //this.setState({
            //    highlightNodeIdList: []
            //})
        }
        if(this.state.enableLines){
            this.renderLines();
        }
    }

    
    
    public constructSelectedNodeList(filters:any, PCPJson:any){
        // Filtering data based on filters.
        if(getLayoutMode() === 3){
            let data = PCPJson.PSData.slice();
            let filterData:any[] = [];
            
            let filters_key = Object.keys(filters);
            const selected = (d:any)=>{
                if(filters_key.length>0){
                    for(let i = 0; i< filters_key.length;i ++){
                        if(filters[filters_key[i]].indexOf(d[filters_key[i]])<0){
                            return false;
                        }
                    }
                    return true;
                }else{
                    return true;
                }
            }
            data.forEach((d:any,index:number)=>{
                if(selected(d)){
                    let dataInstance = d;
                    filterData.push(dataInstance);
                }
            })
            return filterData;
        }
    }

    public renderLines(){
        // this.state.highlightNodeIdList;
        this.InsProjectionViewComputing.renderLines(this.state.enableLines, this.props.width, this.props.height);
        
    }
    public onChangeHighLightNodeIdList(selectedNodeIdList:any, highlightNodeIdList:any, showMode:number){
        this.props.changeSelectedNodeIdList(selectedNodeIdList.slice());
        //this.props.changeProjectionViewSelectedNodes(selectedNodeIdList.length);
        if(highlightNodeIdList.length === 0){
            this.InsProjectionViewComputing.updateHighlightNodeIdList(highlightNodeIdList.slice(),showMode,[]);
        }else{
            this.InsProjectionViewComputing.updateHighlightNodeIdList(highlightNodeIdList.slice(),showMode,selectedNodeIdList.slice());
        }
        
        this.InsProjectionViewComputing.updateNodeStatistic(this.props.changeProjectionViewSelectedNodes, this.props.changeProjectionViewTotalNodeNum);
        this.renderLines();
    }
    public onChangeHoveredNodeIdList(rawNodeIdList:any, hoveredNodeIdList:any, showMode:number){
        //console.log("onChangeHoveredNodeIDList", rawNodeIdList, hoveredNodeIdList, showMode);
        if(hoveredNodeIdList.length === 0){
            this.InsProjectionViewComputing.updateHoveredNodeIdList(hoveredNodeIdList.slice(),showMode,[]);
        }else{
            this.InsProjectionViewComputing.updateHoveredNodeIdList(hoveredNodeIdList.slice(),showMode,rawNodeIdList.slice());
        }
        this.renderLines();        
    }
    public updateSingleHighlightNodeStatus(showMode:number){
        this.InsProjectionViewComputing.updateFullHighlightStatus(showMode);
    }
    public onChangeLines(e:any){
        this.setState({
            enableLines : e
        })
    }
    public onChangeLegends(e:any){
        this.setState({
            enableLegends : e
        })
    }
    public onChangeAggregationMode(e:any){
       this.setState({
           aggregationMode: e
       }) 
    }
    public onLayoutModeChange(e:any){
        this.setState({
            layoutMode: e
        })
    }
    public render() {
        /*
            1. Filter nodes based on filters.
            2. Render 4 projection views. 
        */
        let {filters,PCPJson} = this.props;
        console.log("Selected Node List", filters, PCPJson);
        let layoutMode = this.state.layoutMode;
        /**
         * Data specification:
         * 
         * 1. Filters:
         *  Description of current selected parallel sets ribbons.
         * For example,
         *  {GCN_correctness: ["Wrong"], Label: ["6"]}
         * 
         * 2. PCPJson:
         *  Description of nodes.
         *For example,
         * {PSData: (2708) [{
         *          CN_consistency: {cgt_npt: 1, cgt_ngt: 1, cpt_npt: 1, cpt_ngt: 1}
                    Color: (5) ["#d62728", "#d62728", "#d62728", "#d62728", "#000"]
                    Data_id: 0
                    Degree: "3"
                    GCN w/o features_correctness: "Correct"
                    GCN(w/o_adj)_Prediction_Label: "3"
                    GCN(w/o_features)_Prediction_Label: "3"
                    GCN_Confidence: 0.9778265953063965
                    GCN_Prediction_Label: "3"
                    GCN_correctness: "Correct"
                    GCN_one_hop_accuracy: "1"
                    Ground_Truth_Label: "3"
                    Label: "3"
                    MLP_correctness: "Correct"
                    Real_Degree: 3
                    Shortest_Path_Distance_to_Train_Nodes: 0
                    Spd_node_info: (7) [0, 0, 0, 1, 0, 0, 0]
                    Topkfs_node_info: (7) [0, 0.2, 0.2, 0.4, 0.2, 0, 0]
                    Topkfs_nodes: (5) [{…}, {…}, {…}, {…}, {…}]
         * }]
            accuracy: 0.8124076809453471
            name: "cora_4_1_2_CheckedList_Train_Valid_Test_Others_CheckedList_End_698_1130"
            nodenum: 2708
            pie_name: (3) ["GCN", "MLP", "GCN w/o features"]
            success: true}
         * 
         */


        let selectedNodeIdList:any, selectedNodeList:any ;
        if(PCPJson["success"]){
            selectedNodeList = this.constructSelectedNodeList(filters, PCPJson);
            selectedNodeIdList = selectedNodeList.map((d:any)=>{
                return d['Data_id'];
            })
        }else{
            selectedNodeList = [];
            selectedNodeIdList = [];
        }
        
        this.thisSelectedNodeIdList = selectedNodeIdList;
        
        let marginLeft = 20, marginRight = 20;
        let marginTop = 20, marginBottom = 62;
        let legend_height = 110;
        let projectionHeight = this.props.height - marginBottom - marginTop;
        let gap = 10;
        let projectionWidth = (this.props.width - marginLeft - marginRight) / 4  - gap;
        this.props.changePSSelectedNodes(selectedNodeList.length);
        

        let showModeOptions = [
            [1, "Prediction results comparison"],
            [2, "Surrounding nodes label consistency"],
            [3, "Training nodes structure influence"],
            [4, "Training nodes feature influence"],
        ]
        let layoutOptions = [
            [1,"t-SNE"],
            [2,"UMAP"]
        ];
        let generateAggregationModeButton = () =>{
            if(this.state.aggregationMode === 1){
                return <Button type="default" size="small" onClick={()=>{this.onChangeAggregationMode(2)}}>Detail</Button>;
            }else if(this.state.aggregationMode === 2){
                return <Button type="primary" size="small" onClick={()=>{this.onChangeAggregationMode(1)}}>Cluster</Button>
            }
        }
        let onChangeLegends = this.onChangeLegends;
        let onChangeLines = this.onChangeLines;
        if(selectedNodeIdList.length>0&&selectedNodeIdList.length<300){
            if(!compareSelectedNodeIdList(this.prevSelectedNodeIdList,this.thisSelectedNodeIdList)){
                this.InsProjectionViewComputing.initialize(filters, PCPJson);
            }else{

            }
            this.InsProjectionViewComputing.updateAggregationMode(this.state.aggregationMode);
            this.InsProjectionViewComputing.updateNodeStatistic(this.props.changeProjectionViewSelectedNodes, this.props.changeProjectionViewTotalNodeNum);
            let rawHighlightNodeIdList = this.InsProjectionViewComputing.getRawHighlightNodeIdList();
            if(rawHighlightNodeIdList.length >0){
                this.props.changeSelectedNodeIdList(rawHighlightNodeIdList.slice());

            }

            //this.props.changeProjectionViewSelectedNodes(rawHighlightNodeIdList.length);
            //<Tag>{getNodeStatisticStr(rawHighlightNodeIdList.length, selectedNodeIdList.length)}</Tag>
            //, overflowX: "scroll"
            return (
                <div style={{width: "100%", height:""+(this.props.height - 10)+"px"}}>
                    <div className="ViewTitle">Projection View
                    <div style={{float:'right'}}>
                        {generateAggregationModeButton()}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        Layout:&nbsp;
                        <Select
                            placeholder="Select a layout"
                            value={layoutMode}
                            style={{ width: '90px' }}
                            onChange={this.onLayoutModeChange}
                            size="small"
                        >
                            {layoutOptions.map((d:any)=>(
                                <Option value={d[0]} key={d[0]}>
                                    {d[1]}
                                </Option>
                            ))}
                            </Select>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        Legend: <Switch checked={this.state.enableLegends} onChange={onChangeLegends} />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        Links: <Switch checked={this.state.enableLines} onChange={onChangeLines} />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        #Nodes: <ProjectionViewNodeStatisticContainer/>
                        
                    </div>
                                    
                    </div>
                    <div className="ViewBox"> 
                    <svg
                        style={{ height: ""+(this.props.height - marginBottom + 10)+"px", width: ""+this.props.width+"px" }}
                        id={"TopSVGChart_ScatterPlot"}
                        xmlns="http://www.w3.org/2000/svg"
                        >
                            {this.state.enableLines?(<g key={"c"+1} id="connectionPath"></g>):(<g key={"c"+2} id="connectionPath-Null"></g>)}
                            {showModeOptions.map((d:any)=>{
                                return    <ProjectionView 
                                key={d[0]}
                                id={d[0]} showMode={d[0]} 
                                {...this.props} 
                                x={marginLeft + (d[0]-1)*(projectionWidth+gap)}
                                y={marginTop}
                                height={projectionHeight} 
                                width={projectionWidth} 
                                name={d[1]}
                                selectedNodeIdList={selectedNodeIdList}
                                onChangeHighLightNodeIdList={this.onChangeHighLightNodeIdList}
                                onChangeHoveredNodeIdList={this.onChangeHoveredNodeIdList}
                                renderLines={this.renderLines}
                                dataPackage={this.InsProjectionViewComputing.getDataPackage(d[0],this.state.aggregationMode)}
                                updateSingleHighlightNodeStatus={this.updateSingleHighlightNodeStatus}
                                enableLegends={this.state.enableLegends}
                                layoutMode={this.state.layoutMode}
                                />
                            })}
                            
                    </svg>
                    </div>
                    
                </div>
            )
        }else{
            this.InsProjectionViewComputing.reset();
            return <div style={{width: "100%", height:""+(this.props.height - 10)+"px", overflowX: "hidden"}}>
            
            
                    <div className="ViewTitle">Projection View </div>
            
            </div>
        }
        
    }
}
