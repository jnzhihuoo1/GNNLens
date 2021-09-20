import * as React from 'react';
import { Select, Row, Col, Upload, Icon, Button, message } from 'antd';
import { getModelList, getDatasetList, getExplainMethodsList, getGraphList } from '../../../service/dataService';
import { getLayoutMode } from '../../../helper';
const Option = Select.Option;


export interface DataSelectorProps {
    model_id: number | null,
    graph_id: number | null,
    dataset_id : number | null,
    explain_id : number | null,
    modelList : any,
    datasetList: any,
    explainList: any,
    graphList: any,
    changeModel: any,
    changeDataset: any,
    changeExplainMethod: any,
    changeGraph: any,
    clearIdInfo:any,
    initModelList: any,
    initDatasetList: any,
    initExplainList: any,
    initGraphList: any
}

export interface DataSelectorState {
    //DataSelectorValue : number
}

export default class DataSelector extends React.Component<DataSelectorProps, DataSelectorState> {
    constructor(props: DataSelectorProps) {
        super(props);
        this.onModelSelectorChange = this.onModelSelectorChange.bind(this);
        this.onDatasetSelectorChange = this.onDatasetSelectorChange.bind(this);
        this.onExplainMethodSelectorChange = this.onExplainMethodSelectorChange.bind(this);
        this.onGraphSelectorChange = this.onGraphSelectorChange.bind(this);
        this.state = {
            //DataSelectorValue: 1
            // datarunStatus: IDatarunStatusTypes.PENDING
        };
    }
    componentDidMount(){
        //this.initModelList();
        this.initDatasetList();
    }
    public async initDatasetList(){
        const datasetList_package = await getDatasetList();
        //console.log(datasetList_package);
        if(datasetList_package["success"] === true){
            this.props.initDatasetList(datasetList_package["datasets"]);
        }
        
    }
    public async initModelList(dataset_id:number){
        const modelList_package = await getModelList(dataset_id);
        //console.log(modelList_package);
        if(modelList_package["success"] === true){
            this.props.initModelList(modelList_package["models"]);
        }
        
    }
    public async initExplainList(model_id:number){
        const explainList_package = await getExplainMethodsList(model_id);
        //console.log(explainList_package);
        if(explainList_package["success"] === true){
            this.props.initExplainList(explainList_package["explainMethods"]);
        }
        
    }
    public async initGraphList(dataset_id:number | null) {
        if(dataset_id){
            //console.log(dataset_id);
            let graphlist_package = await getGraphList(dataset_id);
            //console.log(graphlist_package);
            if(graphlist_package["success"] === true){
                // transform obj
                let graph_new_obj = [];
                let ori_obj = graphlist_package["graphs"];
                for(let i = 0; i< ori_obj.length; i++ ){
                    let local_obj = {
                        "key": ori_obj[i][0],
                        "graphno" : ori_obj[i][0],
                        "name": ori_obj[i][1]
                    }
                    graph_new_obj.push(local_obj);
                }
                //console.log(graph_new_obj);
                this.props.initGraphList(graph_new_obj);
            }

        }
    }
    public onModelSelectorChange(value: number) {
        this.props.changeModel(value);
        this.props.changeExplainMethod(null);
        this.initExplainList(value);
    }
    public onDatasetSelectorChange(value: number) {
        let layout_mode = getLayoutMode();
        if(layout_mode === 3){
            
            this.props.changeDataset(value);
            this.props.clearIdInfo();
        }else{
            this.props.changeDataset(value);
            this.props.changeGraph(null);
            this.props.changeExplainMethod(null);
            this.props.initExplainList([]);
            this.props.changeModel(null);
            this.props.clearIdInfo();
            this.initModelList(value);
            this.initGraphList(value);
        }
        
    }
    public onExplainMethodSelectorChange(value: number) {
        this.props.changeExplainMethod(value);
    }
    public onGraphSelectorChange(value: number) {
        this.props.clearIdInfo();
        this.props.changeGraph(value);
    }
    public render() {
        let layout_mode = getLayoutMode();
        //console.log("Render Data Selector", this.props);
        if(layout_mode === 1 || layout_mode === 2){
            let disabledDatasetSelector = this.props.datasetList.length <= 0;
            let disabledModelSelector = this.props.modelList.length <= 0;
            let disabledExplainSelector = this.props.explainList.length <= 0;
            let disabledGraphSelector = this.props.graphList.length <= 0;
            
            return (
                <div className="data-selector">
                
                    <div className="ViewBox" style={{marginTop:"3px", marginLeft:"3px"}}>
                        <Row style={{marginTop: '3px', marginLeft: '3px'}} gutter={6}>
                                Datasets:&nbsp;
    
                                <Select
                                    placeholder="Select a dataset"
                                    value={this.props.dataset_id  || undefined}
                                    style={{ width: '200px' }}
                                    onChange={this.onDatasetSelectorChange}
                                    disabled={disabledDatasetSelector}
                                >
                                    {this.props.datasetList.map((d:any)=>(
                                        <Option value={d.id} key={d.id}>
                                           {d.name}
                                        </Option>
                                    ))}
                                </Select>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            Model:&nbsp;
                            
                                <Select
                                    placeholder="Select a model"
                                    value={this.props.model_id  || undefined}
                                    style={{ width: '200px' }}
                                    onChange={this.onModelSelectorChange}
                                    disabled={disabledModelSelector}
                                >
                                    {this.props.modelList.map((d:any)=>(
                                        <Option value={d.id} key={d.id}>
                                            {d.name}
                                        </Option>
                                    ))}
                                    
                                </Select>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            Explain Methods:&nbsp;
                                <Select
                                    placeholder="Select an explain method"
                                    value={this.props.explain_id  || undefined}
                                    style={{ width: '200px' }}
                                    onChange={this.onExplainMethodSelectorChange}
                                    disabled={disabledExplainSelector}
                                >
                                    {this.props.explainList.map((d:any)=>(
                                        <Option value={d.id} key={d.id}>
                                           {d.name}
                                        </Option>
                                    ))}
                                    
                                </Select>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                            Graph Data:&nbsp;
                                <Select
                                    placeholder="Select a graph data"
                                    value={this.props.graph_id  || undefined}
                                    style={{ width: '200px' }}
                                    onChange={this.onGraphSelectorChange}
                                    disabled={disabledGraphSelector}
                                >
                                    {this.props.graphList.map((d:any)=>(
                                        <Option value={d.key} key={d.key}>
                                           {d.name}
                                        </Option>
                                    ))}
                                    
                                </Select>
                        </Row>
                    </div>
                </div>)
    
        }else{
            let disabledDatasetSelector = this.props.datasetList.length <= 0;
            //if(!disabledDatasetSelector && !this.props.dataset_id){
            //    this.onDatasetSelectorChange(7);
            //}
            return (
                
                        <Row>
                                Datasets:&nbsp;
                                <Select
                                    placeholder="Select a dataset"
                                    value={this.props.dataset_id  || undefined}
                                    style={{ width: '200px' }}
                                    onChange={this.onDatasetSelectorChange}
                                    disabled={disabledDatasetSelector}
                                >
                                    {this.props.datasetList.map((d:any)=>(
                                        <Option value={d.id} key={d.id}>
                                           {d.name}
                                        </Option>
                                    ))}
                                </Select>
                        </Row>
                    
               )
            
        }
    }
}
