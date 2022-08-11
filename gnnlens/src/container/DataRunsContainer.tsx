import DataRuns from '../components/DataRuns'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

//import { decrement, increment } from '../actions';
import { StoreState } from '../types';
import { changeSelectedModels, changeModelsList, changeLoadingDataset,clearIdInfo } from '../actions';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    model: state.model,
    graph : state.graph,
    dataset_id : state.dataset_id,
    explain_id : state.explain_id,
    modelList : state.modelList,
    loading_dataset: state.loading_dataset
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeModelsList: (value:any) => dispatch(changeModelsList(value)),
    changeSelectedModels: (value:any) => dispatch(changeSelectedModels(value)),
    changeLoadingDataset: (value:any) => dispatch(changeLoadingDataset(value)),
    clearIdInfo: () => dispatch(clearIdInfo())
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(DataRuns);



