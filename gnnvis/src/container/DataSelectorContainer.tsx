import DataSelector from '../components/DataRuns/ControlPanel/DataSelector';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {changeModel, initModelList, changeDataset, 
    changeExplainMethod, initDatasetList, initExplainList, initGraphList, changeGraph, clearIdInfo} from '../actions';
//import { decrement, increment } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    model_id: state.model,
    graph_id: state.graph,
    dataset_id: state.dataset_id,
    explain_id: state.explain_id,
    modelList : state.modelList,
    datasetList: state.datasetList,
    explainList: state.explainList,
    graphList: state.graphList
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeModel: (model:number | null) => dispatch(changeModel(model)),
    changeDataset: (dataset_id:number | null) => dispatch(changeDataset(dataset_id)),
    changeExplainMethod: (explain_id:number | null) => dispatch(changeExplainMethod(explain_id)),
    changeGraph: (graph:number | null) => dispatch(changeGraph(graph)),
    clearIdInfo: () => dispatch(clearIdInfo()),
    initModelList : (modelList: any) => dispatch(initModelList(modelList)),
    initDatasetList : (datasetList: any) => dispatch(initDatasetList(datasetList)),
    initExplainList : (explainList: any) => dispatch(initExplainList(explainList)),
    initGraphList : (graphList:any) => dispatch(initGraphList(graphList))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(DataSelector);
