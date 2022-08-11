import ModelSelector from '../components/DataRuns/ControlPanel/ModelSelector';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {changeSelectedModels} from '../actions';
//import { decrement, increment } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    models_list: state.models_list,
    selected_models_list: state.selected_models_list,
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeSelectedModels: (dataset_id:number | null) => dispatch(changeSelectedModels(dataset_id)),
})
// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(ModelSelector);
